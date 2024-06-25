<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Database } from '~/types/supabase';

definePageMeta({
    layout: 'auth',
});

const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const { query } = useRoute();

const { isSubmitting, state, submit } = useSignIn();

// Get redirect path from cookies
const cookieName = runtimeConfig.public.supabase.cookieName;
const redirectPath = useCookie(`${cookieName}-redirect-path`).value;
watchEffect(() => {
    if (user.value) {
        // Clear cookie
        useCookie(`${cookieName}-redirect-path`).value = null;
        // Redirect to path
        return navigateTo((redirectPath === runtimeConfig.public.BASE_URL && '/dashboard') || '/dashboard');
    }
});

onMounted(async () => {
    const errorDescription = query.error_description as string;
    if (errorDescription) toast.error(errorDescription);
});

function useSignIn() {
    type SignInType = z.infer<typeof signInSchema>;
    const supabase = useSupabaseClient<Database>();

    const isSubmitting = ref(false);
    const initialState = {
        email: '',
        password: '',
    };
    const state = ref<SignInType>(initialState);

    async function onSubmit(event: FormSubmitEvent<SignInType>) {
        try {
            state.value = initialState;
            isSubmitting.value = true;

            const { data: user, error: userError } = await supabase.from('Users').select().eq('email', event.data.email).single();
            if (userError) {
                console.error('Error fetching user:', userError);
                throw new Error('Invalid email or password');
            }

            if (user.status !== 'active') {
                console.error('User is not active:', user);
                throw new Error('Your account has been disabled. Please contact your administrator.');
            }

            const { error } = await supabase.auth.signInWithPassword(event.data);
            if (error) {
                console.error('Error signing in:', error);
                throw new Error(error.message);
            }

            toast.success('You have successfully signed in.');
        } catch (e) {
            console.error('Error signing in:', e);
            toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        state,
        isSubmitting,
        submit: onSubmit,
    };
}
</script>

<template>
    <section class="p-32">
        <h1 class="text-3xl font-semibold">Log in</h1>

        <UForm :schema="signInSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" placeholder="Enter your email address" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" :disabled="isSubmitting" placeholder="Enter your password" />
            </UFormGroup>

            <div class="flex items-center justify-between">
                <div>
                    <UCheckbox name="remember_me" label="Remember Me" />
                </div>
                <NuxtLink to="/auth/forgot-password" class="font-medium text-brand">Forgot Password?</NuxtLink>
            </div>

            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Log In </UButton>
        </UForm>

        <p class="mt-4 text-center">
            Don't have an account?
            <NuxtLink to="/auth/signup" class="font-medium text-brand"> Sign Up </NuxtLink>
        </p>
    </section>
</template>

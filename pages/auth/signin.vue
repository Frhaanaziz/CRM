<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Database } from '~/types/supabase';

definePageMeta({
    layout: 'auth',
});

const supabase = useSupabaseClient<Database>();
const { query } = useRoute();

const { isSubmitting, state, submit } = useSignIn();

onMounted(async () => {
    const errorDescription = query.error_description as string;
    if (errorDescription) toast.error(errorDescription);
});

const { authorizeWithGoogle } = useAuthorizeWithGoogle();

function useSignIn() {
    type SignInType = z.infer<typeof signInSchema>;

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

            const { data, error } = await supabase.auth.signInWithPassword(event.data);
            if (error) {
                console.error('Error signing in:', error);
                throw new Error(error.message);
            }

            const sessionStore = userSessionStore();
            sessionStore.session = data.session;
            sessionStore.user = data.user;

            toast.success('You have successfully signed in.');
            await navigateTo('/dashboard');
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
    <section class="relative grid items-center p-32">
        <NuxtImg src="/images/pipeline-logo.png" alt="pipeline" height="32" class="absolute right-0 top-0 p-10" />

        <UCard
            class="mx-auto w-[400px]"
            :ui="{
                body: {
                    base: 'space-y-5',
                    padding: 'px-10 py-10 sm:px-10 sm:py-10 ',
                },
            }"
        >
            <UButton color="black" block size="md" @click="authorizeWithGoogle">
                <NuxtImg src="/icons/google.svg" width="20" height="20" />
                Sign In with Google
            </UButton>

            <UDivider
                label="Or Sign In with Email"
                orientation="horizontal"
                :ui="{
                    container: {
                        base: 'text-gray-500',
                    },
                    label: 'text-xs',
                }"
            />

            <UForm :schema="signInSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
                <UFormGroup label="Email Address" name="email" required>
                    <UInput
                        v-model="state.email"
                        type="email"
                        :disabled="isSubmitting"
                        placeholder="you@example.com"
                        icon="i-heroicons-envelope"
                    />
                </UFormGroup>

                <UFormGroup label="Password" name="password" required>
                    <UInput v-model="state.password" type="password" :disabled="isSubmitting" placeholder="***********" />
                </UFormGroup>

                <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Log In </UButton>
            </UForm>

            <NuxtLink to="/auth/forgot-password" class="block text-brand">Forgot Password?</NuxtLink>

            <p class="text-slate-700">
                Don't have an account?
                <NuxtLink to="/auth/signup" class="text-brand"> Sign Up </NuxtLink>
            </p>

            <p class="text-xs text-slate-500">
                This page is protected by reCAPTCHA and the
                <NuxtLink class="underline" href="#">Google Privacy Policy</NuxtLink> and
                <NuxtLink class="underline" href="#">Terms of Service apply</NuxtLink>.
            </p>
        </UCard>
    </section>
</template>

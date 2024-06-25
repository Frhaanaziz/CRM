<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Database } from '~/types/supabase';

definePageMeta({
    layout: 'auth',
});

const { isSubmitting, state, submit } = useForgotPassword();

function useForgotPassword() {
    type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
    const supabase = useSupabaseClient<Database>();

    const isSubmitting = ref(false);
    const initialState = {
        email: '',
    };
    const state = ref<ForgotPasswordType>(initialState);

    async function submit(event: FormSubmitEvent<ForgotPasswordType>) {
        try {
            state.value = initialState;
            isSubmitting.value = true;

            const { error } = await supabase.auth.resetPasswordForEmail(event.data.email, {
                redirectTo: window.location.origin + '/auth/forgot-password/reset',
            });
            if (error) throw new Error(error.message);

            toast.success('If the email exists in our system, we will send you a password reset link.');
            await navigateTo('/auth/signin');
        } catch (e) {
            console.error('Error sending reset link:', e);
            toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        state,
        isSubmitting,
        submit,
    };
}
</script>

<template>
    <section class="p-32">
        <h1 class="text-3xl font-semibold">Forgot Password</h1>
        <UForm :schema="forgotPasswordSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" placeholder="Enter your email address" />
            </UFormGroup>
            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Send Reset Link </UButton>
        </UForm>
        <p class="mt-4 text-center">
            Remember your password?
            <NuxtLink to="/auth/signin" class="font-medium text-brand"> Sign in </NuxtLink>
        </p>
    </section>
</template>

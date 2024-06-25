<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Database } from '~/types/supabase';

definePageMeta({
    layout: 'auth',
});

const { isSubmitting, state, submit } = useResetPassword();

const { query } = useRoute();
onMounted(async () => {
    const errorDescription = query.error_description as string;
    if (errorDescription) {
        toast.error(errorDescription);
        await navigateTo('/auth/signin');
    }
});

function useResetPassword() {
    type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
    const supabase = useSupabaseClient<Database>();

    const isSubmitting = ref(false);
    const initialState: ResetPasswordType = {
        password: '',
        confirm_password: '',
    };
    const state = ref<ResetPasswordType>(initialState);

    async function submit(event: FormSubmitEvent<ResetPasswordType>) {
        try {
            state.value = initialState;
            isSubmitting.value = true;

            const { error } = await supabase.auth.updateUser({
                password: event.data.password,
            });
            if (error) throw new Error(error.message);

            await navigateTo('/auth/signin');
        } catch (e) {
            console.error('Error resetting password:', e);
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
        <h1 class="text-3xl font-semibold">Reset Password</h1>
        <UForm :schema="resetPasswordSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
            <UFormGroup label="New Password" name="password">
                <UInput v-model="state.password" :disabled="isSubmitting" type="password" placeholder="Enter your new password" />
            </UFormGroup>
            <UFormGroup label="Confirm Password" name="confirm_password">
                <UInput
                    v-model="state.confirm_password"
                    :disabled="isSubmitting"
                    type="password"
                    placeholder="Confirm your new password"
                />
            </UFormGroup>
            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Reset Password </UButton>
        </UForm>
        <p class="mt-4 text-center">
            Remember your password?
            <NuxtLink to="/auth/signin" class="font-medium text-brand"> Sign in </NuxtLink>
        </p>
    </section>
</template>

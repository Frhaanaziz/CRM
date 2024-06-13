import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

/**
 * Custom hook for sign up functionality.
 * @returns An object containing the sign up state, submission status, and submit function.
 */
export const useSignUp = () => {
    const { $api } = useNuxtApp();
    type SignUpType = z.infer<typeof signUpSchema>;

    const isSubmitting = ref(false);
    const initialForm = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    };
    const state = ref<SignUpType>(initialForm);

    /**
     * Handles the form submission for sign up.
     * @param event - The form submit event containing the sign up data.
     */
    async function onSubmit(event: FormSubmitEvent<SignUpType>) {
        try {
            isSubmitting.value = true;
            await $api('/api/auth/sign-up', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            state.value = initialForm;
            toast.success('You have successfully created an account');

            await navigateTo('/auth/signin', { replace: true });
        } catch (e) {
            console.error('Error creating account:', e);
            toast.error('Failed to create account. Please try again later.');
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        state,
        isSubmitting,
        submit: onSubmit,
    };
};

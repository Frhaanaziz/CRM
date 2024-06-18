import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

export const useSignUp = () => {
    type SignUpType = z.infer<typeof signUpSchema>;

    const isSubmitting = ref(false);

    const initialState: SignUpType = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
    };
    const state = ref<SignUpType>(initialState);

    async function onSubmit(event: FormSubmitEvent<SignUpType>) {
        try {
            isSubmitting.value = true;
            await $fetch('/api/auth/sign-up', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            state.value = initialState;
            toast.success('Please check your email to verify your account.');
            await navigateTo('/auth/signin');
        } catch (e) {
            console.error('Error creating account:', e);
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
};

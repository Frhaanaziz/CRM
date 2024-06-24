import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Database } from '~/types/supabase';

export const useSignIn = () => {
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
};

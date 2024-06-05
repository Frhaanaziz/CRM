import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { User } from '~/types';

export default function useUpdateProfile({ user }: { user: User }) {
    type UpdateUserType = z.infer<typeof updateProfileSchema>;

    const userProfile = ref(user);

    const isSubmitting = ref(false);
    const state = ref({
        ...userProfile.value,
        linkedin: userProfile.value.linkedin ?? '',
    });

    async function onSubmit(event: FormSubmitEvent<UpdateUserType>) {
        try {
            isSubmitting.value = true;
            await $fetch(`/api/profile/${userProfile.value?.id}`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            });

            toastSuccess('Profile updated successfully');
        } catch (e) {
            console.log('Error updating profile', e);
            toastError('Error updating profile');
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

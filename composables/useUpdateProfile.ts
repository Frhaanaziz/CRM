import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { User } from '~/types';
import { photoSchema } from '~/utils/validators';

/**
 * Custom composable function for updating user profile.
 * @param {Object} options - The options object.
 * @param {User} options.user - The user object.
 * @returns {Object} - The state and functions for updating the profile.
 */
export default function useUpdateProfile({ user }: { user: User }) {
    type UpdateUserType = z.infer<typeof updateUserSchema>;

    const userProfile = ref(user);

    const photoError = ref('');
    const isSubmitting = ref(false);
    const state = ref({
        ...userProfile.value,
        linkedin: userProfile.value.linkedin ?? '',
    });

    /**
     * Handles the form submission event.
     * @param {FormSubmitEvent<UpdateUserType>} event - The form submission event.
     * @returns {Promise<void>} - A promise that resolves when the profile is updated successfully.
     */
    async function onSubmit(event: FormSubmitEvent<UpdateUserType>): Promise<void> {
        try {
            isSubmitting.value = true;
            await $fetch(`/api/users/${userProfile.value?.id}`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            });

            toast.success('Profile updated successfully');
            reloadNuxtApp({ force: true });
        } catch (e) {
            console.error('Error updating profile', e);
            toast.error('Failed to update profile, please try again later');
        } finally {
            isSubmitting.value = false;
        }
    }

    /**
     * Handles the file change event.
     * @param {Event} event - The file change event.
     * @returns {Promise<void>} - A promise that resolves when the profile photo is updated successfully.
     */
    async function onChangeFile(event: Event): Promise<void> {
        photoError.value = '';
        isSubmitting.value = true;

        const target = event.target as HTMLInputElement;
        const zodResult = photoSchema.safeParse(target.files?.[0]);
        if (!zodResult.success) {
            photoError.value = zodResult.error.issues[0].message;
            isSubmitting.value = false;
            return;
        }

        const formData = new FormData();
        formData.append('photo', zodResult.data);

        try {
            await $fetch(`/api/users/${user.id}/avatar`, {
                method: 'PATCH',
                body: formData,
            });

            toast.success('Profile photo updated');
            await refreshNuxtData('profile');
        } catch (e) {
            console.error('Error updating profile photo', e);
            toast.error('Failed to update profile photo, please try again later');
        }

        isSubmitting.value = false;
    }

    return {
        state,
        isSubmitting,
        submit: onSubmit,
        onChangeFile,
        photoError,
    };
}

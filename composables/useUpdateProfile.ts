import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { User } from '~/types';
import { photoSchema } from '~/utils/validators';

export default function useUpdateProfile({ user }: { user: User }) {
    type UpdateUserType = z.infer<typeof updateProfileSchema>;

    const userProfile = ref(user);

    const photoError = ref('');
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

            toast.success('Profile updated successfully');
        } catch (e) {
            console.log('Error updating profile', e);
            toast.error('Error updating profile');
        } finally {
            isSubmitting.value = false;
        }
    }

    async function onChangeFile(event: Event) {
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
            await $fetch(`/api/profile/${user.id}/avatar`, {
                method: 'PATCH',
                body: formData,
            });

            toast.success('Profile photo updated');
            await refreshNuxtData('profile');
        } catch (e) {
            console.log('Error updating profile photo', e);
            toast.error('Error updating profile photo');
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

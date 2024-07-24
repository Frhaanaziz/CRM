<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { User } from '~/types';
import { photoSchema } from '~/utils/validators';

const sessionStore = userSessionStore();
const { user } = storeToRefs(userSessionStore());
const { data: profile } = await useFetch(`/api/users/${user.value?.id}`, {
    key: `profile-${user.value?.id}`,
});
if (!profile.value) throw createError({ status: 404, message: 'User not found' });

const { state, isSubmitting, submit, onChangeFile, photoError } = useUpdateProfile({
    user: profile.value,
});

function useUpdateProfile({ user }: { user: User }) {
    type UpdateUserType = z.infer<typeof updateUserSchema>;

    const userProfile = ref(user);

    const photoError = ref('');
    const isSubmitting = ref(false);
    const state = ref({
        ...userProfile.value,
        first_name: userProfile.value.first_name || undefined,
        last_name: userProfile.value.last_name || undefined,
        phone: userProfile.value.phone || undefined,
        linkedin: userProfile.value.linkedin || undefined,
    });

    /**
     * Handles the form submission event.
     * @param {FormSubmitEvent<UpdateUserType>} event - The form submission event.
     * @returns {Promise<void>} - A promise that resolves when the profile is updated successfully.
     */
    async function onSubmit(event: FormSubmitEvent<UpdateUserType>): Promise<void> {
        try {
            isSubmitting.value = true;
            const { session } = await $fetch(`/api/users/${userProfile.value?.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Profile updated successfully');

            sessionStore.user = session.user;
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
</script>

<template>
    <div>
        <h1 class="p-7 text-2xl font-semibold">Account Settings</h1>

        <section class="max-w-screen-sm p-7">
            <h2 class="mb-2 text-2xl font-semibold">Profile</h2>

            <p class="font-semibold">Profile Image</p>
            <label for="photo" class="group relative inline-block hover:cursor-pointer">
                <input
                    id="photo"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple="false"
                    class="hidden"
                    @input="onChangeFile"
                />
                <NuxtImg
                    :src="profile?.photo ?? getUserFallbackAvatarUrl(profile)"
                    :alt="profile?.first_name + 'Profile'"
                    icon="i-heroicons-user"
                    width="160"
                    height="160"
                    class="mt-2 rounded-full transition group-hover:blur-sm"
                />
                <UIcon
                    name="i-heroicons-pencil-square"
                    class="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform text-base-300 opacity-0 transition-opacity group-hover:opacity-100"
                />
                <p v-if="photoError" class="text-sm text-red-500">
                    {{ photoError }}
                </p>
            </label>

            <UForm :schema="updateUserSchema" :state="state" class="mt-6 space-y-3" @submit="submit" @error="console.error">
                <UFormGroup label="Email" name="email" required>
                    <UInput v-model="state.email" disabled placeholder="Enter your email" autocomplete="email" />
                </UFormGroup>

                <UFormGroup label="First Name" name="first_name" required>
                    <UInput
                        v-model="state.first_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your first name"
                        autocomplete="given-name"
                    />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name" required>
                    <UInput
                        v-model="state.last_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your last name"
                        autocomplete="family-name"
                    />
                </UFormGroup>

                <UFormGroup label="Phone" name="phone" required>
                    <UInput
                        v-model="state.phone"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="+1 123 456 7890"
                        autocomplete="tel"
                    />
                </UFormGroup>

                <UFormGroup label="LinkedIn URL" name="linkedin">
                    <UInput
                        v-model="state.linkedin"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="https://www.linkedin.com/in/your-profile"
                        autocomplete="url"
                    />
                </UFormGroup>

                <UButton type="submit" size="md" :disabled="isSubmitting" :loading="isSubmitting"> Save </UButton>
            </UForm>
        </section>
    </div>
</template>

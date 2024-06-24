<script setup lang="ts">
import useUpdateProfile from '~/composables/useUpdateProfile';

const user = useSupabaseUser();
const { data: profile } = await useFetch(`/api/users/${user.value?.id}`, {
    key: 'profile',
});
if (!profile.value) throw createError({ status: 404, message: 'User not found' });

const { state, isSubmitting, submit, onChangeFile, photoError } = useUpdateProfile({
    user: profile.value,
});
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
                    :src="profile?.photo ?? '/images/avatar-fallback.jpg'"
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
                <UFormGroup label="Email" name="email">
                    <UInput v-model="state.email" disabled placeholder="Enter your email" autocomplete="email" />
                </UFormGroup>

                <UFormGroup label="First Name" name="first_name">
                    <UInput
                        v-model="state.first_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your first name"
                        autocomplete="given-name"
                    />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name">
                    <UInput
                        v-model="state.last_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your last name"
                        autocomplete="family-name"
                    />
                </UFormGroup>

                <UFormGroup label="Phone" name="phone">
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

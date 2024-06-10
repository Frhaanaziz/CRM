<script setup lang="ts">
import type { KindeAuthState } from '~/types/kinde';
import useUpdateProfile from '~/composables/useUpdateProfile';
import type { User } from '~/types';

const auth = useState('auth') as Ref<KindeAuthState>;
const { data: profile } = await useAPI<User>(
    `/api/profile/${auth.value.user?.id}`,
    {
        key: 'profile',
    }
);
if (!profile.value)
    throw createError({ status: 404, message: 'User not found' });

const { state, isSubmitting, submit, onChangeFile, photoError } =
    useUpdateProfile({
        user: profile.value,
    });
</script>

<template>
    <div>
        <h1 class="p-7 font-semibold text-2xl">Account Settings</h1>

        <div class="bg-base-300 h-5" />

        <section class="p-7 max-w-screen-sm">
            <h2 class="text-2xl font-semibold mb-2">Profile</h2>

            <p class="font-semibold">Profile Image</p>
            <label
                for="photo"
                class="group inline-block relative hover:cursor-pointer"
            >
                <input
                    id="photo"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple="false"
                    class="hidden"
                    @change="onChangeFile"
                />
                <NuxtImg
                    :src="profile?.photo ?? '/images/avatar-fallback.jpg'"
                    :alt="profile?.first_name + 'Profile'"
                    icon="i-heroicons-user"
                    width="160"
                    height="160"
                    class="rounded-full mt-2 group-hover:blur-sm transition"
                />
                <UIcon
                    name="i-heroicons-pencil-square"
                    class="opacity-0 text-base-300 group-hover:opacity-100 transition-opacity w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
                <p v-if="photoError" class="text-sm text-red-500">
                    {{ photoError }}
                </p>
            </label>

            <UForm
                :schema="updateProfileSchema"
                :state="state"
                class="space-y-3 mt-6"
                @submit="submit"
                @error="console.log"
            >
                <UFormGroup label="Email" name="email">
                    <UInput v-model="state.email" disabled />
                </UFormGroup>

                <UFormGroup label="First Name" name="first_name">
                    <UInput
                        v-model="state.first_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name">
                    <UInput
                        v-model="state.last_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="Phone" name="phone">
                    <UInput
                        v-model="state.phone"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="LinkedIn URL" name="linkedin">
                    <UInput
                        v-model="state.linkedin"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                    />
                </UFormGroup>

                <UButton
                    type="submit"
                    size="md"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                >
                    Save
                </UButton>
            </UForm>
        </section>
    </div>
</template>

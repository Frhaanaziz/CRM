<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const { user } = storeToRefs(userSessionStore());
if (!user.value) throw createError({ status: 401, message: 'Unauthorized' });

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { data: rolesOption } = await useLazyFetch('/api/roles', {
    key: 'roles',
    transform: (roles) => roles.map((role) => ({ value: role.id, label: capitalize(role.name) })),
    default: () => [],
});

type InviteUserType = z.infer<typeof inviteUserSchema>;
const isSubmitting = ref(false);
const state = ref({
    email: '',
    role_id: undefined,
});
async function handleSubmit(event: FormSubmitEvent<InviteUserType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/users/${user.value?.id}/invite`, {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        toast.success('User invited successfully');
        closeModal();
    } catch (e) {
        console.error('Error invite user:', e);
        toast.error('Failed to invite user, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Invite User" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">Invite a user via email to be a member of your organization.</p>

            <UForm :schema="inviteUserSchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="Email" name="email" required>
                    <UInput
                        v-model="state.email"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter user email"
                    />
                </UFormGroup>

                <UFormGroup label="Role" name="role_id" required>
                    <USelectMenu
                        v-model="state.role_id"
                        value-attribute="value"
                        option-attribute="label"
                        :options="rolesOption"
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                        placeholder="Select role"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2 pt-4">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Invite</UButton>
                </div>
            </UForm>
        </div>
    </ModalCommon>
</template>

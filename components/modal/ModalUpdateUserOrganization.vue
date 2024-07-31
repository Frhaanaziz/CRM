<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { User } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    user: { id: User['id']; role_id: User['role_id']; status: User['status'] };
}>();

const { data: rolesOption } = await useLazyFetch('/api/roles', {
    key: 'roles',
    transform: (roles) => roles.map((role) => ({ value: role.id, label: capitalize(role.name) })),
    default: () => [],
});
const statusOption = ['active', 'inactive'].map((status) => ({ value: status, label: capitalize(status) }));

const schema = userSchema.pick({ id: true, role_id: true, status: true });
type UpdateUserOrganizationType = z.infer<typeof schema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.user.id,
    role_id: props.user.role_id || undefined,
    status: props.user.status,
});
async function handleSubmit(event: FormSubmitEvent<UpdateUserOrganizationType>) {
    try {
        isSubmitting.value = true;

        const { id, role_id, status } = event.data;
        await Promise.all([
            $fetch(`/api/users/${props.user.id}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ id, role_id }),
            }),
            $fetch(`/api/users/${props.user.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ id, status }),
            }),
        ]);

        closeModal();
        toast.success('Member updated successfully');
        await refreshNuxtData();
    } catch (e) {
        console.error('Error updating member', e);
        toast.error('Failed to update member, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Edit Member" @close="closeModal">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
            <UFormGroup label="Role" name="role" required>
                <USelectMenu
                    v-model="state.role_id"
                    value-attribute="value"
                    :options="rolesOption"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                    placeholder="Select role"
                />
            </UFormGroup>

            <UFormGroup label="Status" name="status" required>
                <USelectMenu
                    v-model="state.status"
                    value-attribute="value"
                    :options="statusOption"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                    placeholder="Select status"
                />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Update</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

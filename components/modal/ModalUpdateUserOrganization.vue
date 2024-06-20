<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Role, User } from '~/types';

const props = defineProps<{
    user: { id: User['id']; role: Role['name'] };
}>();
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

const { data: roles } = useLazyFetch('/api/roles', { key: 'roles' });
const rolesOption = computed(() => roles.value?.map((role) => ({ value: role.name, label: capitalize(role.name) })));

type UpdateUserOrganizationType = z.infer<typeof updateUserOrganizationSchema>;

const isSubmitting = ref(false);
const state = ref({
    role: props.user.role,
});
async function handleSubmit(event: FormSubmitEvent<UpdateUserOrganizationType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/users/${props.user.id}/role`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

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
    <UModal
        :ui="{
            width: 'sm:max-w-sm',
        }"
    >
        <div class="flex items-center justify-between p-3">
            <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Edit Member</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>

        <div class="space-y-3 bg-base-200 p-3">
            <UForm
                :schema="updateUserOrganizationSchema"
                :state="state"
                class="space-y-3"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Role" name="role" required :ui="{ label: { base: 'font-semibold' } }">
                    <USelectMenu
                        v-model="state.role"
                        value-attribute="value"
                        option-attribute="label"
                        :options="rolesOption"
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                        placeholder="Select role"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Update</UButton>
                </div>
            </UForm>
        </div>
    </UModal>
</template>

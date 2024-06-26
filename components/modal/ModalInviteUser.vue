<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

const { data: roles } = await useLazyFetch('/api/roles', { key: 'roles' });
const rolesOption = computed(() => roles.value?.map((role) => ({ value: role.name, label: capitalize(role.name) })));

type InviteUserType = z.infer<typeof inviteUserSchema>;

const isSubmitting = ref(false);
const state = ref<InviteUserType>({
    email: '',
    role: '',
});
async function handleSubmit(event: FormSubmitEvent<InviteUserType>) {
    try {
        isSubmitting.value = true;

        await new Promise((resolve) => setTimeout(resolve, 1000));

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
    <UModal
        :ui="{
            width: 'sm:max-w-sm',
        }"
    >
        <div class="flex items-center justify-between p-3">
            <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Invite User</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>

        <div class="space-y-3 bg-base-200 p-3">
            <p class="text-weak">Invite a user via email to be a member of your organization.</p>

            <UForm :schema="inviteUserSchema" :state="state" class="space-y-3" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="Email" name="email" required>
                    <UInput
                        v-model="state.email"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter user email"
                    />
                </UFormGroup>

                <UFormGroup label="Role" name="role" required>
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
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Invite</UButton>
                </div>
            </UForm>
        </div>
    </UModal>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Lead, User } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    lead: Pick<Lead, 'id'>;
    userId?: User['id'];
}>();

const currentUser = useSupabaseUser();
if (!currentUser.value || !currentUser.value.user_metadata.organization_id)
    throw createError({ status: 401, message: 'Unauthorized' });

const { data: usersOption } = await useLazyFetch(`/api/organizations/${currentUser.value.user_metadata.organization_id}/users`, {
    key: `organizations-${currentUser.value.user_metadata.organization_id}-users`,
    transform: (users) =>
        users
            .map((user) => ({
                value: user.id,
                label: `${getUserFullName(user)} ${currentUser.value!.id === user.id ? '(You)' : ''}`,
            }))
            // Remove current assigned user from the list
            .filter((user) => user.value !== props.userId),
    default: () => [],
});

type UpdateLeadUserId = z.infer<typeof updateLeadUserIdSchema>;
const isSubmitting = ref(false);
const state = ref({
    user_id: props.userId,
});
async function handleSubmit(event: FormSubmitEvent<UpdateLeadUserId>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/leads/${props.lead.id}/user`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData();
        toast.success('Lead assigned successfully');
    } catch (e) {
        console.error(e);
        toast.error('Failed to assign lead, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Assign Lead" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">You will change the ownership of this lead to a user.</p>

            <UForm
                :schema="updateLeadUserIdSchema"
                :state="state"
                class="space-y-8"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Choose User" name="user_id" required>
                    <USelectMenu
                        v-model="state.user_id"
                        value-attribute="value"
                        :options="usersOption"
                        searchable
                        searchable-placeholder="Search a user..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                        placeholder="Select contact"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
                </div>
            </UForm>
        </div>
    </ModalCommon>
</template>

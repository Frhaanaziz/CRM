<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Contact, User } from '~/types';

const props = defineProps<{
    contact: Pick<Contact, 'id'>;
    userId?: User['id'];
}>();
const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const currentUser = useSupabaseUser();
if (!currentUser.value) throw createError({ status: 401, message: 'Unauthorized' });
if (!currentUser.value.user_metadata.organization_id) throw createError({ status: 403, message: 'User Organization Not Found' });

const { data: users } = await useLazyFetch(`/api/organizations/${currentUser.value.user_metadata.organization_id}/users`);
const usersOption = computed(() => {
    return (
        users.value
            ?.map((user) => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name} ${currentUser.value!.id === user.id ? '(You)' : ''}`,
            })) // Remove current assigned user from the list
            .filter((user) => user.value !== props.userId) ?? []
    );
});

type UpdateContactUserId = z.infer<typeof updateContactUserIdSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.contact.id,
    user_id: props.userId,
});
async function handleSubmit(event: FormSubmitEvent<UpdateContactUserId>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/contacts/${props.contact.id}/user-id`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to update contact user id:', e);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Assign Company" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">You will change the ownership of this contact to a user.</p>

            <UForm
                :schema="updateContactUserIdSchema"
                :state="state"
                class="space-y-8"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Choose User" name="user_id" required>
                    <USelectMenu
                        v-model="state.user_id"
                        value-attribute="value"
                        option-attribute="label"
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

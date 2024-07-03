<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Opportunity, User } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    opportunity: Pick<Opportunity, 'id'>;
    userId?: User['id'];
}>();

const currentUser = useSupabaseUser();
if (!currentUser.value || !currentUser.value.user_metadata.organization_id)
    throw createError({ status: 401, message: 'Unauthorized' });

const { data: users } = await useLazyFetch(`/api/organizations/${currentUser.value.user_metadata.organization_id}/users`);
const usersOption = computed(() => {
    return (
        users.value?.map((user) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name} ${currentUser.value!.id === user.id ? '(You)' : ''}`,
        })) ?? []
    );
});

type UpdateOpportunityUserId = z.infer<typeof updateOpportunityUserIdSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.opportunity.id,
    user_id: props.userId,
});
async function handleSubmit(event: FormSubmitEvent<UpdateOpportunityUserId>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/opportunities/${props.opportunity.id}/user-id`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData(`opportunities-${props.opportunity.id}`);
    } catch (e) {
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Assign Opportunity" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">You will change the ownership of this opportunity to a user.</p>

            <UForm
                :schema="updateOpportunityUserIdSchema"
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

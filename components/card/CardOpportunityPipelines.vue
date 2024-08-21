<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { OpportunityStatus } from '~/types';

const props = defineProps<{
    opportunityStatus: OpportunityStatus;
    no: number;
}>();
const { opportunityStatus, no } = toRefs(props);

const isEditMode = ref(false);
const isDeleting = ref(false);

const { editState, isEditing, editOpportunityStatus } = useEditOpportunityStatus();

async function deleteOpportunityStatus() {
    try {
        isDeleting.value = true;

        await $fetch(`/api/opportunity-statuses/${opportunityStatus.value.id}`, {
            method: 'DELETE',
        });

        toast.success('Opportunity status has been updated successfully.');
        isEditMode.value = false;
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to update opportunity status:', e);
        toast.error('Failed to update opportunity status, please try again later.');
    } finally {
        isDeleting.value = false;
    }
}
function useEditOpportunityStatus() {
    type EditOpportunityStatusType = z.infer<typeof editOpportunityStatusSchema>;
    const isEditing = ref(false);

    const initialState = {
        name: opportunityStatus.value.name,
    };
    const editState = ref<EditOpportunityStatusType>({ ...initialState });
    async function editOpportunityStatus(event: FormSubmitEvent<EditOpportunityStatusType>) {
        try {
            isEditing.value = true;

            await $fetch(`/api/opportunity-statuses/${opportunityStatus.value.id}`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            });

            toast.success('Opportunity status added successfully');
            isEditMode.value = false;
            await refreshNuxtData();
        } catch (e) {
            console.error('Error add opportunity status:', e);
            toast.error('Failed to add opportunity status, please try again later.');
        } finally {
            isEditing.value = false;
        }
    }

    return {
        editState,
        isEditing,
        editOpportunityStatus,
    };
}
</script>

<template>
    <li class="flex items-center gap-4 p-4 [&:not(:last-child)]:border-b" :class="{ 'bg-brand-50': isEditMode }">
        <UButton variant="ghost" square color="black" icon="i-heroicons-bars-3" size="xs" class="handle cursor-move" />
        <span>{{ no }}</span>
        <LazyUForm
            v-if="isEditMode"
            :state="editState"
            :schema="editOpportunityStatusSchema"
            class="flex flex-1 items-end gap-2"
            @submit="editOpportunityStatus"
            @error="console.error"
        >
            <UFormGroup name="name" required class="flex-1">
                <UInput v-model="editState.name" :disabled="isEditing" placeholder="Enter status name" />
            </UFormGroup>

            <UButton type="submit" variant="ghost" size="xs" :disabled="isEditing" :loading="isEditing"> Save </UButton>
        </LazyUForm>
        <template v-else>
            <p class="flex-1 capitalize">
                {{ opportunityStatus.name }}
            </p>
            <UBadge
                :ui="{ rounded: 'rounded-full', font: 'font-semibold' }"
                :color="opportunityStatus.name === 'won' ? 'green' : opportunityStatus.name === 'lost' ? 'black' : 'primary'"
            >
                {{ opportunityStatus.name === 'won' ? 'Won' : opportunityStatus.name === 'lost' ? 'Lost' : 'Active' }}
            </UBadge>
            <UButton
                v-if="!(opportunityStatus.name == 'won' || opportunityStatus.name == 'lost')"
                variant="ghost"
                square
                color="black"
                icon="i-heroicons-pencil"
                size="xs"
                :padded="false"
                @click="isEditMode = true"
            />
            <UButton
                v-if="!(opportunityStatus.name == 'won' || opportunityStatus.name == 'lost')"
                variant="ghost"
                square
                color="black"
                icon="i-heroicons-trash"
                size="xs"
                :disabled="isDeleting"
                :padded="false"
                @click="deleteOpportunityStatus"
            />
        </template>
    </li>
</template>

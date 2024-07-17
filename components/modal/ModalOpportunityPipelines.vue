<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import Draggable from 'vuedraggable';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { data: opportunityStatuses } = await useLazyFetch('/api/opportunity-statuses', {
    key: 'opportunity-statuses',
});

const { createState, isCreating, addOpportunityStatus } = useAddOpportunityStatus();

const isReordering = ref(false);
async function onUpdate({ newIndex }: { newIndex: number; oldIndex: number }) {
    if (!opportunityStatuses.value) return;
    try {
        isReordering.value = true;

        // index_number of the task above the dragged and dropped task
        const prevElIndexNumber = opportunityStatuses.value[newIndex - 1]?.index_number;
        // index_number of the task under the dragged and dropped task
        const nextElIndexNumber = opportunityStatuses.value[newIndex + 1]?.index_number;

        await $fetch(`/api/opportunity-statuses/${opportunityStatuses.value[newIndex].id}/reorder`, {
            method: 'POST',
            body: JSON.stringify({
                prevElIndexNumber,
                nextElIndexNumber,
            }),
        });
    } catch (error) {
        console.error('Error updating opportunity status:', error);
        toast.error('Failed to reorder opportunity status, please try again later.');
    } finally {
        isReordering.value = false;
    }
}

function useAddOpportunityStatus() {
    type AddOpportunityStatusType = z.infer<typeof createOpportunityStatusSchema>;
    const isCreating = ref(false);

    const initialState = {
        name: '',
    };
    const createState = ref<AddOpportunityStatusType>({ ...initialState });
    async function addOpportunityStatus(event: FormSubmitEvent<AddOpportunityStatusType>) {
        try {
            isCreating.value = true;

            await $fetch('/api/opportunity-statuses', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            createState.value = { ...initialState };
            toast.success('Opportunity status added successfully');
            await refreshNuxtData();
        } catch (e) {
            console.error('Error add opportunity status:', e);
            toast.error('Failed to add opportunity status, please try again later.');
        } finally {
            isCreating.value = false;
        }
    }

    return {
        createState,
        isCreating,
        addOpportunityStatus,
    };
}
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-md',
        }"
    >
        <div class="flex items-center justify-between p-4">
            <p class="text-xl font-semibold">Opportunity Pipelines & Status</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" square @click="closeModal" />
        </div>

        <div class="bg-base-200 p-4">
            <UForm
                :state="createState"
                :schema="createOpportunityStatusSchema"
                class="flex items-end gap-2"
                @submit="addOpportunityStatus"
                @error="console.error"
            >
                <UFormGroup label="Status Name" name="name" required class="flex-1">
                    <UInput v-model="createState.name" :disabled="isCreating" placeholder="Enter status name" />
                </UFormGroup>

                <UButton type="submit" icon="i-heroicons-plus" size="xs" :disabled="isCreating" :loading="isCreating">
                    Add
                </UButton>
            </UForm>
        </div>

        <Draggable
            v-if="opportunityStatuses"
            :list="opportunityStatuses"
            tag="ul"
            handle=".handle"
            item-key="id"
            ghostClass="opacity-50"
            :disabled="isReordering"
            @update="onUpdate"
        >
            <template #item="{ element, index }">
                <CardOpportunityPipelines :opportunityStatus="element" :no="index + 1" />
            </template>
        </Draggable>
        <template v-else>
            <USkeleton class="h-[60px] w-full" :ui="{ background: 'bg-gray-200' }" />
            <USkeleton class="h-[60px] w-full" :ui="{ background: 'bg-gray-200' }" />
            <USkeleton class="h-[60px] w-full" :ui="{ background: 'bg-gray-200' }" />
            <USkeleton class="h-[60px] w-full" :ui="{ background: 'bg-gray-200' }" />
            <USkeleton class="h-[60px] w-full" :ui="{ background: 'bg-gray-200' }" />
        </template>
    </UModal>
</template>

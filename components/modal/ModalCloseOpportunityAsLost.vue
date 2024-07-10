<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Opportunity, OpportunityStatus } from '~/types';

const props = defineProps<{
    opportunity: Pick<Opportunity, 'id' | 'act_close_date' | 'act_revenue'>;
    lostStatus: OpportunityStatus;
}>();

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { user } = storeToRefs(userSessionStore());
if (!user.value) throw createError({ status: 401, message: 'Unauthorized' });

const { data: closeReasonsOption } = await useLazyFetch('/api/close-reasons', {
    key: 'close-reasons',
    transform: (data) => data.map((item) => ({ value: item.id, label: capitalize(item.name) })),
});

type CloseOpportunityAsLostType = z.infer<typeof updateOpportunityAsLostSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.opportunity.id,
    close_reason_id: undefined,
    act_revenue: props.opportunity.act_revenue ?? 0,
    act_close_date: props.opportunity.act_close_date ?? undefined,
});
async function handleSubmit(event: FormSubmitEvent<CloseOpportunityAsLostType>) {
    try {
        isSubmitting.value = true;

        await Promise.all([
            $fetch(`/api/opportunities/${props.opportunity.id}/opportunity-status-id`, {
                method: 'PATCH',
                body: JSON.stringify({ id: props.opportunity.id, opportunity_status_id: props.lostStatus.id }),
            }),
            $fetch(`/api/opportunities/${props.opportunity.id}/close-reason-id`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            }),
            $fetch(`/api/opportunities/${props.opportunity.id}/act-revenue`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            }),
            $fetch(`/api/opportunities/${props.opportunity.id}/act-close-date`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            }),
        ]);

        closeModal();
        await refreshNuxtData(`opportunities-${props.opportunity.id}`);
        toast.success('Opportunity closed as lost successfully.');
    } catch (e) {
        console.error('Failed to close opportunity as lost', e);
        toast.error('Failed to close opportunity as lost, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Close Opportunity As Lost" @close="closeModal">
        <UForm
            :schema="updateOpportunityAsLostSchema"
            :state="state"
            class="space-y-4"
            @submit="handleSubmit"
            @error="console.error"
        >
            <UFormGroup label="Status Reason" name="close_reason_id" required>
                <USelect
                    v-model="state.close_reason_id"
                    :options="closeReasonsOption ?? []"
                    option-attribute="label"
                    value-attribute="value"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Select a reason"
                />
            </UFormGroup>

            <UFormGroup label="Actual Revenue" name="act_revenue" required>
                <UInput
                    v-model.number="state.act_revenue"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                >
                    <template #leading>
                        <span class="text-sm"> Rp. </span>
                    </template>
                </UInput>
            </UFormGroup>

            <UFormGroup label="Close Date" name="act_close_date" required>
                <UInput v-model="state.act_close_date" type="date" :disabled="isSubmitting" :loading="isSubmitting" />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Close As Lost</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

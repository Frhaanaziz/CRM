<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Opportunity, OpportunityStatus } from '~/types';

const props = defineProps<{
    opportunity: Pick<Opportunity, 'id' | 'act_close_date' | 'act_revenue'>;
    wonStatus: OpportunityStatus;
}>();

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { user } = storeToRefs(userSessionStore());
if (!user.value) throw createError({ status: 401, message: 'Unauthorized' });

type CloseOpportunityAsWonType = z.infer<typeof updateOpportunityAsWonSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.opportunity.id,
    act_revenue: props.opportunity.act_revenue ?? 0,
    act_close_date: props.opportunity.act_close_date ?? undefined,
});
async function handleSubmit(event: FormSubmitEvent<CloseOpportunityAsWonType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/opportunities/${props.opportunity.id}/close-as-won`, {
            method: 'POST',
            body: JSON.stringify({
                ...event.data,
                opportunity_status_id: props.wonStatus.id,
            }),
        });

        closeModal();
        toast.success('Opportunity closed as won successfully.');
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to close opportunity as won', e);
        toast.error('Failed to close opportunity as won, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Close Opportunity As Won" @close="closeModal">
        <UForm
            :schema="updateOpportunityAsWonSchema"
            :state="state"
            class="space-y-4"
            @submit="handleSubmit"
            @error="console.error"
        >
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
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Close As Won</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

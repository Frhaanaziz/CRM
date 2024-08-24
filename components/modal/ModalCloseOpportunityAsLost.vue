<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Opportunity } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    opportunity: Pick<Opportunity, 'id' | 'act_close_date' | 'act_revenue'>;
}>();

const { user } = storeToRefs(userSessionStore());
if (!user.value) throw createError({ status: 401, message: 'Unauthorized' });

type CloseOpportunityAsLostType = z.infer<typeof updateOpportunityAsLostSchema>;
const isSubmitting = ref(false);
const state = ref({
    close_reason_id: undefined,
    act_revenue: props.opportunity.act_revenue ?? 0,
    act_close_date: props.opportunity.act_close_date ?? undefined,
});
async function handleSubmit(event: FormSubmitEvent<CloseOpportunityAsLostType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/opportunities/${props.opportunity.id}/close-as-lost`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData();
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
                    :options="opportunityCloseReasons.map((reason) => ({ label: capitalize(reason), value: reason }))"
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

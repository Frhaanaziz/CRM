<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';
import type { Contact, Opportunity } from '~/types';

const props = defineProps<{
    leadId: number;
    opportunities: (Opportunity & { contact?: Contact | null })[];
    contacts?: Contact[] | null;
}>();

const { data: opportunityStatusesOption } = await useLazyFetch('/api/opportunity-statuses', {
    key: 'opportunity-statuses',
    transform: (data) => data.map((status) => ({ value: status.id, label: capitalize(status.name) })),
    default: () => [],
});

const isCreating = ref(false);

const initialState = {
    confidence: 50,
    contact_id: undefined,
    est_close_date: undefined,
    est_revenue: 0,
    opportunity_status_id: undefined,
    payment_plan: undefined,
    notes: undefined,
};
const state = ref({ ...initialState });
const isSubmitting = ref(false);

type AddLeadOpportunityType = z.infer<typeof addLeadOpportunitySchema>;
async function handleSubmit(event: FormSubmitEvent<AddLeadOpportunityType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/leads/${props.leadId}/opportunity`, {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        await refreshNuxtData();
        state.value = { ...initialState };
        isCreating.value = false;
    } catch (e) {
        console.error('Failed to add lead opportunity', e);
        toast.error('Failed to add opportunity, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-slate-700">
                    Opportunities <span v-if="!!opportunities.length">({{ opportunities.length }})</span>
                </h2>
                <UButton variant="ghost" square color="black" :padded="false" @click="isCreating = !isCreating">
                    <UIcon name="i-heroicons-plus" class="h-6 w-6" />
                </UButton>
            </div>
        </template>

        <div v-if="isCreating" class="bg-brand-50 p-4">
            <LazyUForm
                :schema="addLeadOpportunitySchema"
                :state="state"
                class="space-y-3"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Status" name="opportunity_status_id" required>
                    <USelectMenu
                        v-model="state.opportunity_status_id"
                        value-attribute="value"
                        :options="opportunityStatusesOption"
                        :disabled="isSubmitting"
                        placeholder="Select status"
                    />
                </UFormGroup>

                <div class="grid grid-cols-2 gap-2">
                    <UFormGroup label="Estimated Close" name="est_close_date" required>
                        <UInput
                            v-model.date="state.est_close_date"
                            type="datetime-local"
                            placeholder="DD/MM/YYYY"
                            :disabled="isSubmitting"
                        />
                    </UFormGroup>
                    <UFormGroup label="Confidence" name="confidence" required>
                        <UInput
                            v-model.number="state.confidence"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="---"
                            :disabled="isSubmitting"
                            :ui="{
                                form: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                            }"
                        >
                            <template #trailing>
                                <span class="text-sm"> % </span>
                            </template>
                        </UInput>
                    </UFormGroup>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <UFormGroup label="Value" name="est_revenue" required>
                        <UInput
                            v-model.number="state.est_revenue"
                            type="number"
                            min="0"
                            placeholder="999999"
                            :disabled="isSubmitting"
                            :ui="{
                                form: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                            }"
                        >
                            <template #leading>
                                <span class="text-sm"> Rp </span>
                            </template>
                        </UInput>
                    </UFormGroup>
                    <UFormGroup label="Payment Plan" name="payment_plan" required>
                        <USelectMenu
                            v-model="state.payment_plan"
                            :options="[...opportunityPaymentPlans]"
                            :disabled="isSubmitting"
                            placeholder="Select plan"
                        />
                    </UFormGroup>
                </div>

                <UFormGroup label="Contact" name="contact_id" required>
                    <USelectMenu
                        v-model="state.contact_id"
                        value-attribute="value"
                        :options="contacts?.map((contact) => ({ value: contact.id, label: getUserFullName(contact) }))"
                        :disabled="isSubmitting"
                        placeholder="Select contact"
                    />
                </UFormGroup>

                <UFormGroup label="Notes" name="notes">
                    <UInput v-model="state.notes" placeholder="Add notes here..." :disabled="isSubmitting" />
                </UFormGroup>

                <div class="grid grid-cols-2 gap-2">
                    <UButton
                        type="button"
                        variant="ghost"
                        color="black"
                        :disabled="isSubmitting"
                        block
                        @click="isCreating = false"
                    >
                        Cancel
                    </UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting" block>Save</UButton>
                </div>
            </LazyUForm>
        </div>

        <ul v-if="!!opportunities?.length" class="divide-y">
            <LazyCardOpportunity v-for="opportunity in opportunities" :key="opportunity.id" :opportunity />
        </ul>

        <UButton
            v-if="!(isCreating || opportunities?.length > 0)"
            variant="ghost"
            color="black"
            block
            class="justify-start text-slate-700"
            @click="isCreating = true"
        >
            Add New Opportunity
        </UButton>
    </UCard>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Company, Contact, Lead } from '~/types';

interface ILead extends Lead {
    company: (Pick<Company, 'id' | 'name'> & { contacts?: Contact[] | null }) | null;
}

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const loadingLeads = ref(false);
const leads = ref<ILead[]>([]);

type AddOpportunityType = z.infer<typeof addOpportunitySchema>;
const isSubmitting = ref(false);
const state = ref({
    confidence: 50,
    contact_id: undefined,
    est_close_date: undefined,
    est_revenue: undefined,
    lead_id: undefined,
    opportunity_status_id: undefined,
    payment_plan: undefined,
    notes: undefined,
});
const company_id = computed(() => leads.value.find((lead) => lead.id === state.value.lead_id)?.company_id);

const { data: opportunityStatuses } = await useLazyFetch('/api/opportunity-statuses', {
    key: 'opportunity-statuses',
    default: () => [],
});

const {
    data: contactsOption,
    execute,
    status: contactsStatus,
} = await useLazyFetch(`/api/contacts/check`, {
    query: { company_id },
    immediate: false,
    transform: (contacts) => contacts.map((contact) => ({ value: contact.id, label: getUserFullName(contact) })),
    default: () => [],
});
watch(company_id, () => {
    if (company_id.value) {
        execute();
        state.value.contact_id = undefined;
    }
});

async function handleSubmit(event: FormSubmitEvent<AddOpportunityType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/opportunities', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        closeModal();
        toast.success('Opportunity added successfully.');
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to add opportunity', e);
        toast.error('Failed to add opportunity, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
async function searchLeads(query: string) {
    try {
        loadingLeads.value = true;

        const leadsPaginated = await $fetch('/api/leads', {
            query: {
                query,
                page: 1,
                limit: 10,
            },
        });

        leads.value = leadsPaginated.result;
        return leads.value.map((lead) => ({
            value: lead.id,
            label: lead.company?.name,
        }));
    } catch (error) {
        console.error('Failed to search leads', error);
        toast.error('Failed to search leads, please try again later.');
        return [];
    } finally {
        loadingLeads.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Add New Opportunity" @close="closeModal">
        <UForm :schema="addOpportunitySchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
            <UFormGroup label="Lead" name="lead_id" required>
                <USelectMenu
                    v-model="state.lead_id"
                    value-attribute="value"
                    :searchable="searchLeads"
                    :loading="loadingLeads"
                    :debounce="300"
                    :placeholder="
                        state.lead_id ? leads.find((lead) => lead.id === state.lead_id)?.company?.name : 'Search lead...'
                    "
                />
            </UFormGroup>

            <UFormGroup label="Status" name="opportunity_status_id" required>
                <USelectMenu
                    v-model="state.opportunity_status_id"
                    value-attribute="value"
                    :options="opportunityStatuses.map((status) => ({ value: status.id, label: capitalize(status.name) }))"
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
                    :options="contactsOption"
                    :loading="contactsStatus === 'pending'"
                    :disabled="isSubmitting"
                    placeholder="Select contact"
                />
            </UFormGroup>

            <UFormGroup label="Notes" name="notes">
                <UInput v-model="state.notes" placeholder="Add notes here..." :disabled="isSubmitting" />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

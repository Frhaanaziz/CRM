<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';
import type { Contact, Opportunity } from '~/types';

const props = defineProps<{
    leadId: number;
    opportunities: (Opportunity & { contact?: Contact | null })[];
    contacts: Contact[];
}>();

const { data: opportunityStatusesOption } = await useLazyFetch('/api/opportunity-statuses', {
    key: 'opportunity-statuses',
    transform: (data) => data.map((status) => ({ value: status.id, label: capitalize(status.name) })),
    default: () => [],
});

const isCreating = ref(false);

const initialState = {
    confidence: undefined,
    contact_id: undefined,
    est_close_date: undefined,
    est_revenua: undefined,
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
                <UFormGroup label="Status" name="description" required>
                    <USelectMenu
                        v-model="state.opportunity_status_id"
                        value-attribute="value"
                        :options="opportunityStatusesOption"
                        :disabled="isSubmitting"
                        placeholder="Select status"
                    />
                </UFormGroup>

                <div>
                    <UFormGroup label="Estimated Close" name="est_close_date" required>
                        <UInput
                            v-model.date="state.est_close_date"
                            type="datetime-local"
                            placeholder="DD/MM/YYYY"
                            :disabled="isSubmitting"
                        />
                    </UFormGroup>
                    <UFormGroup label="Confidence" name="confidence" required>
                        <UInput v-model="state.confidence" type="number" placeholder="50" :disabled="isSubmitting" />
                    </UFormGroup>
                </div>

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

        <!-- <div v-if="!!opportunitites?.length" class="divide-y">
            <LazyCardOpportunity v-for="task in opportunitites" :key="task.id" :task="task" :lead_id="lead_id" :opportunity_id="opportunity_id" />
        </div> -->

        <!-- <UButton
            v-if="!(isCreating || opportunitites?.length > 0)"
            variant="ghost"
            color="black"
            block
            class="justify-start text-slate-700"
            @click="isCreating = true"
        >
            Add New Task
        </UButton> -->
    </UCard>
</template>

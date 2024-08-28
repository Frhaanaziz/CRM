<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { Contact, Opportunity, OpportunityStatus } from '~/types';
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const props = defineProps<{
    opportunity: Opportunity & {
        status?: OpportunityStatus | null;
        contact?: Contact | null;
    };
    opportunityStatusesOption: {
        value: number;
        label: string;
    }[];
    contacts?: Contact[] | null;
}>();
const store = globalStore();

const items = [
    [
        {
            label: 'Edit',
            icon: 'i-heroicons-pencil',
            click: () => (isEditingMode.value = true),
        },
        {
            label: 'Delete',
            icon: 'i-heroicons-trash-20-solid',
            click: deleteOpportunity,
        },
    ],
];

const isEditingMode = ref(false);
const isUpdating = ref(false);

const { updateState, updateOpportunity } = useUpdateOpportunity();

async function deleteOpportunity() {
    try {
        isUpdating.value = true;

        await $fetch(`/api/opportunities/${props.opportunity.id}`, {
            method: 'DELETE',
        });

        await refreshNuxtData();
    } catch (error) {
        console.error('Error deleting opportunity', error);
        toast.error('Failed to delete opportunity, please try again later.');
    } finally {
        isUpdating.value = false;
    }
}
function useUpdateOpportunity() {
    type UpdateOpportunityType = z.infer<typeof updateOpportunitySchema>;
    const updateState = ref({
        confidence: props.opportunity.confidence || undefined,
        contact_id: props.opportunity.contact?.id || undefined,
        // est_close_date: props.opportunity.est_close_date || undefined,
        est_close_date: props.opportunity.est_close_date
            ? useDateFormat(props.opportunity.est_close_date, 'YYYY-MM-DDThh:mm').value.replace('"', '')
            : undefined,
        est_revenue: props.opportunity.est_revenue || undefined,
        opportunity_status_id: props.opportunity.opportunity_status_id || undefined,
        payment_plan: props.opportunity.payment_plan || undefined,
        notes: props.opportunity.notes || undefined,
    });

    async function updateOpportunity(event: FormSubmitEvent<UpdateOpportunityType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/opportunities/${props.opportunity.id}`, {
                method: 'PATCH',
                body: JSON.stringify(event.data),
            });

            toast.success('Opportunity updated successfully');
            isEditingMode.value = false;
            await refreshNuxtData();
        } catch (error) {
            console.error('Error updating opportunity', error);
            toast.error('Failed to update opportunity, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { updateState, updateOpportunity };
}
</script>

<template>
    <li>
        <LazyUForm
            v-if="isEditingMode"
            :schema="updateOpportunitySchema"
            :state="updateState"
            class="space-y-3 bg-brand-50 p-4"
            @submit="updateOpportunity"
            @error="console.error"
        >
            <UFormGroup label="Status" name="opportunity_status_id" required>
                <USelectMenu
                    v-model="updateState.opportunity_status_id"
                    value-attribute="value"
                    :options="opportunityStatusesOption"
                    :disabled="isUpdating"
                    placeholder="Select status"
                />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-2">
                <UFormGroup label="Est. Close" name="est_close_date" required>
                    <UInput
                        v-model.date="updateState.est_close_date"
                        type="datetime-local"
                        placeholder="DD/MM/YYYY"
                        :disabled="isUpdating"
                    />
                </UFormGroup>
                <UFormGroup label="Confidence" name="confidence" required>
                    <UInput
                        v-model.number="updateState.confidence"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="---"
                        :disabled="isUpdating"
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
                <UFormGroup label="Est. Revenue" name="est_revenue" required>
                    <UInput
                        v-model.number="updateState.est_revenue"
                        type="number"
                        min="0"
                        placeholder="999999"
                        :disabled="isUpdating"
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
                        v-model="updateState.payment_plan"
                        :options="[...opportunityPaymentPlans]"
                        :disabled="isUpdating"
                        placeholder="Select plan"
                    />
                </UFormGroup>
            </div>

            <UFormGroup label="Contact" name="contact_id" required>
                <USelectMenu
                    v-model="updateState.contact_id"
                    value-attribute="value"
                    :options="contacts?.map((contact) => ({ value: contact.id, label: getUserFullName(contact) }))"
                    :disabled="isUpdating"
                    placeholder="Select contact"
                />
            </UFormGroup>

            <UFormGroup label="Notes" name="notes">
                <UInput v-model="updateState.notes" placeholder="Add notes here..." :disabled="isUpdating" />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2">
                <UButton type="button" variant="outline" :disabled="isUpdating" @click="isEditingMode = false">Cancel</UButton>
                <UButton type="submit" :disabled="isUpdating" :loading="isUpdating">Save</UButton>
            </div>
        </LazyUForm>

        <div v-else class="border-l-4 border-l-brand p-2">
            <div class="flex items-center justify-between">
                <UBadge variant="subtle" size="xs" class="capitalize">
                    {{ opportunity.status?.name || '---' }}
                </UBadge>

                <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
                    <UButton
                        :padded="false"
                        icon="i-heroicons-ellipsis-vertical"
                        square
                        variant="ghost"
                        color="black"
                        :disabled="isUpdating"
                    />
                </UDropdown>
            </div>
            <p class="font-semibold text-slate-900">
                {{ opportunity.est_revenue ? formatToRupiah(opportunity.est_revenue) : '---' }}
            </p>
            <p class="text-sm text-slate-900">
                {{ opportunity.confidence ? `${opportunity.confidence}%` : '---' }} on
                {{
                    opportunity.est_close_date
                        ? useDateFormat(opportunity.est_close_date, 'DD/MM/YYYY').value.replace('"', '')
                        : '---'
                }}
            </p>
            <div v-if="opportunity.contact" class="flex items-center justify-between py-1">
                <div class="text-slate-700">
                    <p class="font-semibold">{{ getUserFullName(opportunity.contact) }}</p>
                    <p v-if="opportunity.contact?.job_title" class="text-xs">{{ opportunity.contact.job_title }}</p>
                </div>
                <div class="flex gap-2">
                    <UButton square icon="i-heroicons-envelope-solid" variant="ghost" color="black" disabled />

                    <UButton
                        square
                        icon="i-heroicons-phone-solid"
                        variant="ghost"
                        color="black"
                        :disabled="!opportunity.contact?.mobile_phone"
                        @click="store.makeCall({ contact: opportunity.contact, opportunity_id: opportunity.id })"
                    />
                </div>
            </div>
            <p v-if="opportunity.notes" class="pt-2 text-sm">{{ opportunity.notes }}</p>
        </div>
    </li>
</template>

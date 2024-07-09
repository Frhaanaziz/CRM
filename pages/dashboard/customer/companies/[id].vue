<script lang="ts" setup>
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useRefHistory } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddCompanyContact from '~/components/modal/ModalAddCompanyContact.vue';
import LazyModalAddCompanyPrimaryContact from '~/components/modal/ModalAddCompanyPrimaryContact.vue';
import LazyModalEditCompanyPrimaryContact from '~/components/modal/ModalEditCompanyPrimaryContact.vue';
import LazyModalAssignCompany from '~/components/modal/ModalAssignCompany.vue';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const user = useSupabaseUser();
const organization_id = user.value?.user_metadata.organization_id;
if (!user.value || !organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const { data: company, refresh: refreshCompany } = await useFetch(`/api/companies/${id}`, {
    key: `companies-${id}`,
});
if (!company.value) throw createError({ status: 404, message: 'Company not found' });

const { data: opportunityStatusesOption } = await useLazyFetch(`/api/organizations/${organization_id}/opportunity-statuses`, {
    key: `organizations-${organization_id}-opportunity-statuses`,
    transform: (data) => data.map((status) => ({ label: capitalize(status.name), value: status.id })),
});
const { data: paymentPlansOption } = await useLazyFetch('/api/payment-plans', {
    key: `payment-plans`,
    transform: (data) => data.map((plan) => ({ label: capitalize(plan.name), value: plan.id })),
});
const contactsOption = computed(() =>
    company.value!.contacts.map((contact) => ({
        value: contact.id,
        label: `${contact.first_name ?? ''} ${contact.last_name ?? ''}`,
    }))
);

const isOpportunityEditMode = ref(false);

const companyForm = ref<null | {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}>(null);

const { opportunityState, isCreatingOpportunity, handleSubmitOpportunity } = useOpportunity();

async function handleDeleteCompanies() {
    try {
        await $fetch(`/api/companies/${id}`, { method: 'DELETE' });

        toast.success('Company has been deleted successfully.');
        await refreshNuxtData('companies');
        await navigateTo('/dashboard/customer/companies');
    } catch (e) {
        console.error('Failed to delete company:', e);
        toast.error('Failed to delete company, please try again later.');
    }
}
function useOpportunity() {
    type AddOpportunityType = z.infer<typeof addCompanyOpportunitySchema>;
    const isSubmitting = ref(false);
    const initialState = {
        organization_id,
        company_id: id,
        user_id: user.value!.id,
        topic: '',
        act_close_date: new Date(),
        confidence: 0,
        est_revenue: 0,
        opportunity_status_id: undefined,
        payment_plan_id: undefined,
        contact_id: undefined,
    };
    const state = ref({ ...initialState });

    async function createOpportunity(event: FormSubmitEvent<AddOpportunityType>) {
        try {
            isSubmitting.value = true;

            await $fetch(`/api/companies/${company.value!.id}/opportunities`, {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            toast.success('Opportunity added successfully.');
            isOpportunityEditMode.value = false;
            await refreshCompany();
            state.value = { ...initialState };
        } catch (e) {
            console.error('Failed to add opportunity', e);
            toast.error('Failed to add opportunity, please try again later.');
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        opportunityState: state,
        isCreatingOpportunity: isSubmitting,
        handleSubmitOpportunity: createOpportunity,
    };
}
</script>

<template>
    <div v-if="company" class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/customer/companies" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>
                <UButton
                    variant="ghost"
                    icon="i-heroicons-user"
                    color="black"
                    class="font-semibold"
                    @click="
                        modal.open(LazyModalAssignCompany, {
                            onClose: () => modal.close(),
                            company: { id: company!.id },
                            userId: company!.user_id ?? undefined,
                        })
                    "
                >
                    Assign
                </UButton>
                <UButton
                    variant="ghost"
                    icon="i-heroicons-trash"
                    color="black"
                    class="font-semibold"
                    @click="
                        modal.open(LazyModalDelete, {
                            onClose: () => modal.close(),
                            title: 'Company',
                            description:
                                'Deleting company will delete all records under the company as well (for example opportunities, tasks, and activities). Are you sure to delete this Company? You can’t undo this action.',
                            onConfirm: handleDeleteCompanies,
                        })
                    "
                >
                    Delete
                </UButton>

                <template v-if="companyForm?.isFormDirty">
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-arrow-path"
                        color="black"
                        class="font-semibold"
                        :disabled="companyForm?.isUpdating"
                        @click="companyForm?.resetForm"
                    >
                        Reset
                    </UButton>
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-bookmark"
                        color="black"
                        class="font-semibold"
                        :disabled="companyForm?.isUpdating"
                        @click="companyForm?.submitForm"
                    >
                        Save
                    </UButton>
                </template>
            </div>

            <div class="flex items-center justify-between p-4">
                <div class="flex flex-col gap-1">
                    <h1 class="text-xl font-semibold">{{ company.name }}</h1>
                    <p class="text-sm">Company</p>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <p class="text-weak font-semibold">Rp35.000.000</p>
                        <p class="text-weak text-xs">Annual Revenue</p>
                    </div>

                    <template v-if="company.user">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex items-center gap-2">
                            <UAvatar :src="company.user.photo ?? '/images/avatar-fallback.jpg'" />
                            <div>
                                <p class="font-semibold">{{ `${company.user.first_name} ${company.user.last_name}` }}</p>
                                <p class="text-xs">Owner</p>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </header>

        <section class="m-4 grid gap-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <CardCompanyDetails ref="companyForm" :company="company" />

                <UCard v-if="company.opportunities" :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">
                                OPPORTUNITIES <span class="text-weak">({{ company.opportunities.length }})</span>
                            </h2>
                            <UButton
                                icon="i-heroicons-plus"
                                variant="ghost"
                                square
                                color="black"
                                @click="isOpportunityEditMode = !isOpportunityEditMode"
                            />
                        </div>
                    </template>

                    <div v-if="isOpportunityEditMode" class="bg-brand-50 p-4">
                        <UForm
                            :schema="addCompanyOpportunitySchema"
                            :state="opportunityState"
                            class="space-y-3"
                            @submit="handleSubmitOpportunity"
                            @error="console.error"
                        >
                            <UFormGroup label="Topic" name="topic" required>
                                <UInput
                                    v-model="opportunityState.topic"
                                    :disabled="isCreatingOpportunity"
                                    :loading="isCreatingOpportunity"
                                    placeholder="Enter opportunity topic"
                                />
                            </UFormGroup>

                            <UFormGroup label="Status" name="opportunity_status_id" required>
                                <USelectMenu
                                    v-model="opportunityState.opportunity_status_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="opportunityStatusesOption ?? []"
                                    :loading="isCreatingOpportunity"
                                    :disabled="isCreatingOpportunity"
                                    placeholder="Select status"
                                />
                            </UFormGroup>

                            <UFormGroup label="Confidence" name="confidence">
                                <UInput
                                    v-model.number="opportunityState.confidence"
                                    type="number"
                                    inputmode="numeric"
                                    min="0"
                                    max="100"
                                    :disabled="isCreatingOpportunity"
                                    :loading="isCreatingOpportunity"
                                >
                                    <template #leading>
                                        <span class="text-sm"> % </span>
                                    </template>
                                </UInput>
                            </UFormGroup>

                            <div class="grid grid-cols-2 gap-2">
                                <UFormGroup label="Estimated Revenue" name="est_revenue">
                                    <UInput
                                        v-model.number="opportunityState.est_revenue"
                                        type="number"
                                        inputmode="numeric"
                                        min="0"
                                        :disabled="isCreatingOpportunity"
                                        :loading="isCreatingOpportunity"
                                    >
                                        <template #leading>
                                            <span class="text-sm"> Rp </span>
                                        </template>
                                    </UInput>
                                </UFormGroup>

                                <UFormGroup label="Payment Plan" name="payment_plan_id">
                                    <USelectMenu
                                        v-model="opportunityState.payment_plan_id"
                                        value-attribute="value"
                                        option-attribute="label"
                                        :options="paymentPlansOption ?? []"
                                        :loading="isCreatingOpportunity"
                                        :disabled="isCreatingOpportunity"
                                        placeholder="Select payment plan"
                                    />
                                </UFormGroup>
                            </div>

                            <UFormGroup label="Contact" name="contact_id" required>
                                <USelectMenu
                                    v-model="opportunityState.contact_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="contactsOption ?? []"
                                    :loading="isCreatingOpportunity"
                                    :disabled="isCreatingOpportunity"
                                    placeholder="Select contact"
                                />
                            </UFormGroup>

                            <div class="flex items-center justify-end gap-2">
                                <UButton
                                    type="button"
                                    variant="outline"
                                    :disabled="isCreatingOpportunity"
                                    @click="isOpportunityEditMode = false"
                                >
                                    Cancel
                                </UButton>
                                <UButton type="submit" :disabled="isCreatingOpportunity" :loading="isCreatingOpportunity">
                                    Save
                                </UButton>
                            </div>
                        </UForm>
                    </div>

                    <div v-if="!!company.opportunities?.length" class="divide-y">
                        <CardOpportunity
                            v-for="opportunity in company.opportunities"
                            :key="opportunity.id"
                            :opportunity="opportunity"
                        />
                    </div>
                    <UButton
                        v-if="!(isOpportunityEditMode || company.opportunities.length)"
                        variant="ghost"
                        color="black"
                        block
                        class="text-weak mx-2 mb-4 mt-1 justify-start"
                        @click="isOpportunityEditMode = true"
                    >
                        Add New Opportunity
                    </UButton>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">Primary Contact</h2>
                            <UButton
                                v-if="!!company?.primaryContact"
                                icon="i-heroicons-pencil"
                                variant="ghost"
                                square
                                color="black"
                                @click="
                                    modal.open(LazyModalEditCompanyPrimaryContact, {
                                        onClose: () => modal.close(),
                                        company: { id: company!.id },
                                        primaryContact: company.primaryContact,
                                    })
                                "
                            />
                        </div>
                    </template>

                    <div v-if="company.primaryContact" class="rounded-lg border p-4">
                        <div class="flex items-center gap-4">
                            <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                            <div class="flex-1">
                                <p class="font-semibold text-brand">
                                    {{ `${company.primaryContact.first_name} ${company.primaryContact.last_name}` }}
                                </p>
                                <p class="text-xs">{{ company.primaryContact.job_title }}</p>
                            </div>
                            <UButton color="black" variant="ghost" icon="i-heroicons-envelope" square disabled />
                            <UButton color="black" variant="ghost" icon="i-heroicons-phone" square disabled />
                        </div>
                    </div>
                    <UButton
                        v-else
                        variant="outline"
                        icon="i-heroicons-plus"
                        size="xs"
                        @click="
                            modal.open(LazyModalAddCompanyPrimaryContact, {
                                onClose: () => modal.close(),
                                company: { id: company!.id },
                            })
                        "
                    >
                        Add Primary Contact
                    </UButton>

                    <div class="space-y-2">
                        <div class="mt-8 flex items-center justify-between">
                            <h3 class="text-xl font-semibold">Contacts</h3>
                            <UButton
                                variant="outline"
                                icon="i-heroicons-plus"
                                size="xs"
                                @click="
                                    modal.open(LazyModalAddCompanyContact, {
                                        onClose: () => modal.close(),
                                        company: { id: company!.id, name: company!.name },
                                    })
                                "
                                >Add Contact</UButton
                            >
                        </div>

                        <ul v-if="company.contacts" class="space-y-4">
                            <li v-for="contact in company.contacts" :key="contact.id" class="flex items-center gap-4">
                                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                                <div>
                                    <p class="font-semibold">{{ `${contact.first_name} ${contact.last_name}` }}</p>
                                    <p class="text-xs">{{ contact.job_title }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </UCard>
            </div>

            <div class="md:col-span-8">
                <CardTimeline />
            </div>
        </section>
    </div>
</template>

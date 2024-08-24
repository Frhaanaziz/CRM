<script lang="ts" setup>
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignLead from '~/components/modal/ModalAssignLead.vue';
import type { DropdownItem } from '#ui/types';

interface FormRef {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { data: lead } = await useFetch(`/api/leads/${id}`, {
    key: `leads-${id}`,
    headers: useRequestHeaders(['cookie']),
    // sort opportunities by created_at in descending order
    transform: (lead) => ({
        ...lead,
        opportunities: lead.opportunities?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    }),
});
if (!lead.value) throw createError({ status: 404, message: 'Lead not found' });

const companyForm = ref<FormRef | null>(null);
const submitCompanyForm = () => companyForm.value?.submitForm();
const resetCompanyForm = () => companyForm.value?.resetForm();
const isCompanyFormDirty = computed(() => companyForm.value?.isFormDirty);
const isUpdatingCompany = computed(() => companyForm.value?.isUpdating);

const isUpdatingStatus = ref(false);
const isEditingAddressMode = ref(false);

const items: DropdownItem[][] = [
    [
        {
            label: 'Inbound - Trial',
            click: () => updateStatus('Inbound - Trial'),
        },
        {
            label: 'Inbound - Trial Expired',
            click: () => updateStatus('Inbound - Trial Expired'),
        },
        {
            label: 'Outboud - Potential',
            click: () => updateStatus('Outboud - Potential'),
        },
        {
            label: 'Outboud - Interested',
            click: () => updateStatus('Outboud - Interested'),
        },
        {
            label: 'Outboud - Qualified',
            click: () => updateStatus('Outboud - Qualified'),
        },
        {
            label: 'Customer',
            click: () => updateStatus('Customer'),
        },
        {
            label: 'Canceled',
            click: () => updateStatus('Canceled'),
        },
        {
            label: 'Bad Fit',
            click: () => updateStatus('Bad Fit'),
        },
        {
            label: 'Not Interested',
            click: () => updateStatus('Not Interested'),
        },
    ],
];

const address = ref(lead.value.company?.address ?? undefined);
async function updateCompanyAddress() {
    try {
        await $fetch(`/api/companies/${lead.value?.company?.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ address: address.value }),
        });

        await refreshNuxtData(`leads-${id}`);
    } catch (e) {
        console.error('Failed to update Company address:', e);
        toast.error('Failed to update Company address, please try again later.');
    }
}
async function updateStatus(status: string) {
    try {
        isUpdatingStatus.value = true;

        await $fetch(`/api/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });

        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to update Lead status:', e);
        toast.error('Failed to update Lead status, please try again later.');
    } finally {
        isUpdatingStatus.value = false;
    }
}
async function handleDeleteLead() {
    try {
        await $fetch(`/api/leads/${id}`, { method: 'DELETE' });

        toast.success('Lead has been deleted successfully.');
        await refreshNuxtData();
        await navigateTo('/dashboard/pipeline/leads');
    } catch (e) {
        console.error('Failed to delete Lead:', e);
        toast.error('Failed to delete Lead, please try again later.');
    }
}
</script>

<template>
    <div v-if="lead" class="min-h-screen bg-base-200">
        <header class="sticky top-0 z-10 bg-base-100 shadow">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/pipeline/leads" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>

                <UButton
                    variant="ghost"
                    icon="i-heroicons-user"
                    color="black"
                    class="font-semibold"
                    @click="
                        modal.open(LazyModalAssignLead, {
                            onClose: () => modal.close(),
                            lead: { id: lead!.id },
                            userId: lead!.user_id,
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
                            title: 'Lead',
                            description: 'Are you sure you want to delete this lead This action cannot be undone.',
                            onConfirm: handleDeleteLead,
                        })
                    "
                >
                    Delete
                </UButton>

                <LazyUButton
                    v-if="isCompanyFormDirty"
                    variant="ghost"
                    icon="i-heroicons-arrow-path"
                    color="black"
                    class="font-semibold"
                    :disabled="isUpdatingCompany"
                    @click="resetCompanyForm"
                >
                    Reset
                </LazyUButton>
                <LazyUButton
                    v-if="isCompanyFormDirty"
                    variant="ghost"
                    icon="i-heroicons-bookmark"
                    color="black"
                    class="font-semibold"
                    :disabled="isUpdatingCompany"
                    @click="submitCompanyForm"
                >
                    Save
                </LazyUButton>
            </div>

            <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <div v-if="lead.company" class="flex flex-col gap-1">
                        <h1 class="text-xl font-semibold">
                            {{ lead.company.name }}
                        </h1>
                        <button
                            v-if="!(lead.company.address || isEditingAddressMode)"
                            class="flex items-center gap-1.5"
                            @click="isEditingAddressMode = true"
                        >
                            <UIcon name="i-heroicons-plus" />
                            <span class="text-sm text-slate-600"> Add address </span>
                        </button>
                        <UInput
                            v-else
                            v-model="address"
                            :padded="false"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1 ',
                                    },
                                },
                            }"
                            @blur="updateCompanyAddress"
                        />
                    </div>
                </div>

                <UDropdown
                    :items="items.map((item) => item.filter((i) => i.label !== lead!.status))"
                    :ui="{ item: { disabled: 'cursor-text select-text' } }"
                    :popper="{ placement: 'bottom-start' }"
                    :disabled="isUpdatingStatus"
                >
                    <div :class="[isUpdatingStatus ? 'cursor-not-allowed opacity-50' : '']">
                        <p class="text-center text-xs text-gray-500">Status</p>
                        <div class="flex items-center gap-1">
                            <p class="font-semibold">{{ lead.status || '---' }}</p>
                            <UIcon name="i-heroicons-chevron-down-solid" class="h-5 w-5" />
                        </div>
                    </div>
                    <!-- <template #item="{ item }">
                        <span class="truncate">{{ item.label.split(' - ')?.at(1) ?? item.label }}</span>

                        <UIcon :name="item.icon" class="ms-auto h-4 w-4 flex-shrink-0 text-gray-700" />
                    </template> -->
                </UDropdown>
            </div>
        </header>

        <section class="grid gap-4 p-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-slate-700">Lead Info</h2>
                    </template>

                    <div class="grid grid-cols-12 text-slate-700">
                        <ul class="col-span-4 space-y-2 font-semibold">
                            <li>Lead Owner</li>
                            <li>Lead Source</li>
                            <li>Rating</li>
                        </ul>
                        <ul class="col-span-8 space-y-2">
                            <li class="flex items-center gap-1.5">
                                <UAvatar :src="lead.user?.photo ?? getFallbackAvatarUrl(getUserFullName(lead.user))" size="2xs" />
                                <p class="truncate">{{ getUserFullName(lead.user) }}</p>
                            </li>
                            <li class="capitalize">{{ lead.source }}</li>
                            <li class="capitalize">{{ lead.rating?.name }}</li>
                        </ul>
                    </div>
                </UCard>

                <CardTasks v-if="lead.tasks" :tasks="lead.tasks" :lead_id="id" />

                <CardContacts
                    v-if="lead.company?.contacts"
                    :contacts="lead.company.contacts"
                    :lead_id="id"
                    :company_id="lead.company.id"
                />

                <CardCompany v-if="lead && lead.company" ref="companyForm" :company="lead.company" />

                <CardOpportunities
                    v-if="lead.opportunities"
                    :opportunities="lead.opportunities"
                    :contacts="lead.company?.contacts"
                    :leadId="id"
                />

                <CardCompanyOverviews
                    v-if="lead.company?.overviews"
                    :company_id="lead.company.id"
                    :overviews="lead.company.overviews"
                />
            </div>

            <div class="md:col-span-8">
                <CardTimeline :lead_id="id" />
            </div>
        </section>
    </div>
</template>

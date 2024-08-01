<script lang="ts" setup>
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignLead from '~/components/modal/ModalAssignLead.vue';
import type { DisqualifyReason, LeadStatuses } from '~/types';
import type { DropdownItem } from '#ui/types';

interface FormRef {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { data: disqualifyReasons } = await useLazyFetch('/api/disqualify-reasons', {
    key: 'disqualify-reasons',
    headers: useRequestHeaders(['cookie']),
});
const { data: lead } = await useFetch(`/api/leads/${id}`, {
    key: `leads-${id}`,
    headers: useRequestHeaders(['cookie']),
});
if (!lead.value) throw createError({ status: 404, message: 'Lead not found' });

const isUpdatingStatus = ref(false);

const contactForm = ref<FormRef | null>(null);
const submitContactForm = () => contactForm.value?.submitForm();
const resetContactForm = () => contactForm.value?.resetForm();
const isContactFormDirty = computed(() => contactForm.value?.isFormDirty);
const isUpdatingContact = computed(() => contactForm.value?.isUpdating);

const companyForm = ref<FormRef | null>(null);
const submitCompanyForm = () => companyForm.value?.submitForm();
const resetCompanyForm = () => companyForm.value?.resetForm();
const isCompanyFormDirty = computed(() => companyForm.value?.isFormDirty);
const isUpdatingCompany = computed(() => companyForm.value?.isUpdating);

const items: DropdownItem[][] = [
    [
        {
            label: 'Inbound',
            icon: 'i-heroicons-pencil-square',
            class: 'font-semibold text-gray-700',
            disabled: true,
        },
        {
            label: 'Inbound - Trial',
        },
        {
            label: 'Inbound - Trial Expired',
        },
        {
            label: 'Inbound - Customer',
        },
        {
            label: 'Inbound - Canceled',
        },
        {
            label: 'Inbound - Bad Fit',
        },
    ],
    [
        {
            label: 'Outboud',
            icon: 'i-heroicons-pencil-square',
            class: 'font-semibold text-gray-700',
            disabled: true,
        },
        {
            label: 'Outboud - Potential',
        },
        {
            label: 'Outboud - Interested',
        },
        {
            label: 'Outboud - Qualified',
        },
        {
            label: 'Outboud - Customer',
        },
        {
            label: 'Outboud - Not Interested',
        },
        {
            label: 'Outboud - Bad Fit',
        },
    ],
];

async function reopenLead(status: LeadStatuses) {
    try {
        isUpdatingStatus.value = true;

        await fetch(`/api/leads/${id}/reopen`, {
            method: 'POST',
            body: JSON.stringify({ id, status }),
        });

        modal.close();
        toast.success('Lead reopened successfully');
        await refreshNuxtData();
    } catch (error) {
        console.error('Error reopening lead', error);
        toast.error('Failed reopening lead, please try again later');
    } finally {
        isUpdatingStatus.value = false;
    }
}
async function qualifyLead() {
    try {
        isUpdatingStatus.value = true;

        await fetch(`/api/leads/${id}/qualify`, {
            method: 'POST',
        });

        modal.close();
        toast.success('Lead qualified successfully');
        await refreshNuxtData();
    } catch (error) {
        console.error('Error qualifying lead', error);
        toast.error('Failed qualifying lead, please try again later');
    } finally {
        isUpdatingStatus.value = false;
    }
}
async function disqualifyLead(disqulifyReason: DisqualifyReason) {
    try {
        isUpdatingStatus.value = true;

        await fetch(`/api/leads/${id}/disqualify`, {
            method: 'POST',
            body: JSON.stringify({ id, disqualify_reason_id: disqulifyReason.id }),
        });

        modal.close();
        toast.success('Lead disqualified successfully');
        await refreshNuxtData();
    } catch (error) {
        console.error('Error disqualifying lead', error);
        toast.error('Failed disqualifying lead, please try again later');
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

                <template v-if="!(lead.status === 'qualified' || lead.status === 'disqualified')">
                    <!-- Qualify Button -->
                    <LazyUButton
                        variant="ghost"
                        color="black"
                        class="font-semibold"
                        label="Qualify"
                        :loading="isUpdatingStatus"
                        :disabled="isUpdatingStatus"
                        @click="qualifyLead"
                    >
                        <template #leading>
                            <UIcon name="i-heroicons-check" class="h-5 w-5 text-green-700" />
                        </template>
                    </LazyUButton>

                    <!-- Disqualify pop over -->
                    <LazyUPopover>
                        <UButton
                            variant="ghost"
                            color="black"
                            class="font-semibold"
                            label="Disqualify"
                            :loading="isUpdatingStatus"
                            :disabled="isUpdatingStatus"
                        >
                            <template #leading>
                                <UIcon name="i-heroicons-x-mark" class="h-5 w-5 text-red-700" />
                            </template>
                        </UButton>

                        <template v-if="disqualifyReasons" #panel="{ close }">
                            <div class="flex w-56 flex-col p-1">
                                <button
                                    v-for="reason in disqualifyReasons"
                                    :key="reason.id"
                                    class="rounded p-2 text-start text-sm capitalize hover:bg-brand-50"
                                    :disabled="isUpdatingStatus"
                                    @click="
                                        () => {
                                            close();
                                            disqualifyLead(reason);
                                        }
                                    "
                                >
                                    {{ reason.name }}
                                </button>
                            </div>
                        </template>
                    </LazyUPopover>
                </template>
                <UPopover v-else>
                    <UButton
                        label="Reopen Lead"
                        variant="ghost"
                        color="black"
                        class="font-semibold"
                        :loading="isUpdatingStatus"
                        :disabled="isUpdatingStatus"
                    >
                        <template #leading>
                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5" />
                        </template>
                    </UButton>

                    <template #panel="{ close }">
                        <div class="flex w-56 flex-col p-1">
                            <button
                                v-for="status in leadStatuses.filter(
                                    (status) => !(status === 'disqualified' || status === 'qualified')
                                )"
                                :key="status"
                                class="rounded p-2 text-start text-sm capitalize hover:bg-brand-50"
                                :disabled="isUpdatingStatus"
                                @click="
                                    () => {
                                        close();
                                        reopenLead(status);
                                    }
                                "
                            >
                                {{ status }}
                            </button>
                        </div>
                    </template>
                </UPopover>

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
                    v-if="isContactFormDirty || isCompanyFormDirty"
                    variant="ghost"
                    icon="i-heroicons-arrow-path"
                    color="black"
                    class="font-semibold"
                    :disabled="isUpdatingContact || isUpdatingCompany"
                    @click="
                        () => {
                            resetContactForm();
                            resetCompanyForm();
                        }
                    "
                >
                    Reset
                </LazyUButton>
                <LazyUButton
                    v-if="isContactFormDirty"
                    variant="ghost"
                    icon="i-heroicons-bookmark"
                    color="black"
                    class="font-semibold"
                    :disabled="isUpdatingContact"
                    @click="submitContactForm"
                >
                    Save Contact
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
                    Save Company
                </LazyUButton>
            </div>

            <div v-if="lead" class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <div v-if="lead.contact && lead.company" class="flex flex-col gap-1">
                        <h1 class="text-xl font-semibold">
                            {{ lead.company.name }}
                        </h1>
                        <button class="flex items-center gap-1.5">
                            <UIcon name="i-heroicons-plus" />
                            <span class="text-sm text-slate-600"> Add address </span>
                        </button>
                    </div>
                </div>

                <UDropdown
                    :items="items"
                    :ui="{ item: { disabled: 'cursor-text select-text' } }"
                    :popper="{ placement: 'bottom-start' }"
                >
                    <div>
                        <p class="text-center text-xs text-gray-500">Status</p>
                        <div class="flex items-center gap-1">
                            <p class="font-semibold">Inbound - Potential</p>
                            <UIcon name="i-heroicons-chevron-down-solid" class="h-5 w-5" />
                        </div>
                    </div>
                    <template #item="{ item }">
                        <span class="truncate">{{ item.label.split(' - ')?.at(1) ?? item.label }}</span>

                        <UIcon :name="item.icon" class="ms-auto h-4 w-4 flex-shrink-0 text-gray-700" />
                    </template>
                </UDropdown>
            </div>
        </header>

        <section class="grid gap-4 p-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <p v-if="lead.status === 'disqualified' && lead.disqualify_reason" class="text-weak rounded-lg bg-red-100 p-4">
                    This lead is disqualified because
                    <span class="font-semibold capitalize">{{ lead.disqualify_reason.name }}.</span>
                </p>

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
                                <p class="truncate text-brand">{{ getUserFullName(lead.user) }}</p>
                            </li>
                            <li class="capitalize">{{ lead.source?.name }}</li>
                            <li class="capitalize">{{ lead.rating?.name }}</li>
                        </ul>
                    </div>
                </UCard>

                <CardTasks v-if="lead.tasks" :tasks="lead.tasks" :lead_id="id" />

                <!-- <CardContactDetails v-if="lead && lead.contact" ref="contactForm" :contact="lead.contact" /> -->

                <UCard v-if="lead.contact" :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="font-semibold text-slate-700">Contacts</h2>
                            <!-- <UButton variant="ghost" square color="black" :padded="false" @click="isCreatingTask = !isCreatingTask"> -->
                            <UButton variant="ghost" square color="black" :padded="false" disabled>
                                <UIcon name="i-heroicons-plus" class="h-6 w-6" />
                            </UButton>
                        </div>
                    </template>

                    <ul class="text-slate-700">
                        <li class="flex items-center justify-between px-2 py-1 [&:not(:last-child)]:border-b">
                            <div>
                                <p class="font-semibold">{{ getUserFullName(lead.contact) }}</p>
                                <p v-if="lead.contact.job_title" class="text-xs">{{ lead.contact?.job_title }}CEO</p>
                            </div>
                            <div class="flex gap-2">
                                <UButton square icon="i-heroicons-envelope-solid" variant="ghost" color="black" disabled />
                                <UButton square icon="i-heroicons-phone-solid" variant="ghost" color="black" disabled />
                            </div>
                        </li>
                    </ul>
                </UCard>

                <CardCompany v-if="lead && lead.company" ref="companyForm" :company="lead.company" />
            </div>

            <div class="md:col-span-8">
                <CardTimeline :lead_id="id" />
            </div>
        </section>
    </div>
</template>

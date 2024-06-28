<script lang="ts" setup>
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignLead from '~/components/modal/ModalAssignLead.vue';
import LazyModalAddLeadTopic from '~/components/modal/ModalAddLeadTopic.vue';
import type { DisqualifyReason } from '~/types';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const isUpdatingStatus = ref(false);

const { data: disqualifyReasons } = await useLazyFetch('/api/disqualify-reasons', {
    key: 'disqualify-reasons',
});
const { data: lead, refresh: refreshLead } = await useFetch(`/api/leads/${id}`, {
    key: `lead-${id}`,
});
if (!lead.value) throw createError({ status: 404, message: 'Lead not found' });

async function reopenLead() {
    try {
        isUpdatingStatus.value = true;

        const leadStatus = await $fetch('/api/lead-statuses/new');

        await fetch(`/api/leads/${id}/lead-status-id`, {
            method: 'PATCH',
            body: JSON.stringify({ id, lead_status_id: leadStatus.id, disqualify_reason_id: null }),
        });

        modal.close();
        toast.success('Lead reopened successfully');
        await refreshLead();
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

        const leadStatus = await $fetch('/api/lead-statuses/qualified');

        await fetch(`/api/leads/${id}/lead-status-id`, {
            method: 'PATCH',
            body: JSON.stringify({ id, lead_status_id: leadStatus.id }),
        });

        modal.close();
        toast.success('Lead qualified successfully');
        await refreshLead();
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

        const leadStatus = await $fetch('/api/lead-statuses/disqualified');

        await fetch(`/api/leads/${id}/lead-status-id`, {
            method: 'PATCH',
            body: JSON.stringify({ id, lead_status_id: leadStatus.id, disqualify_reason_id: disqulifyReason.id }),
        });

        modal.close();
        toast.success('Lead disqualified successfully');
        await refreshLead();
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
        await refreshNuxtData('leads');
        await navigateTo('/dashboard/pipeline/leads');
    } catch (e) {
        console.error('Failed to delete Lead:', e);
        toast.error('Failed to delete Lead, please try again later.');
    }
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/pipeline/leads" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>

                <template v-if="lead?.status?.name === 'new'">
                    <!-- Qualify Button -->
                    <UButton
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
                    </UButton>

                    <!-- Disqualify pop over -->
                    <UPopover>
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
                    </UPopover>
                </template>
                <template v-else>
                    <UButton
                        variant="ghost"
                        color="black"
                        class="font-semibold"
                        label="Reopen Lead"
                        :loading="isUpdatingStatus"
                        :disabled="isUpdatingStatus"
                        @click="reopenLead"
                    >
                        <template #leading>
                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5" />
                        </template>
                    </UButton>
                </template>

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
                            title: 'Leads',
                            description: 'Are you sure you want to delete this lead? This action cannot be undone.',
                            onConfirm: handleDeleteLead,
                        })
                    "
                >
                    Delete
                </UButton>
            </div>

            <div v-if="lead" class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                    <div v-if="lead.contact && lead.company" class="flex flex-col gap-1">
                        <h1 class="text-xl font-semibold">
                            {{ `${lead.contact.first_name ?? ''} ${lead.contact.last_name ?? ''}` }}
                        </h1>
                        <p class="text-sm">{{ lead.contact.job_title }} &#128900; {{ lead.company.name }}</p>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <p class="font-semibold text-green-600">{{ lead.score }}</p>
                        <p class="text-weak text-xs">Lead Score</p>
                    </div>

                    <template v-if="lead.source">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex flex-col">
                            <p class="text-weak font-semibold capitalize">{{ lead.source.name }}</p>
                            <p class="text-weak text-xs">Lead Source</p>
                        </div>
                    </template>

                    <template v-if="lead.rating">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex flex-col">
                            <p class="text-weak font-semibold capitalize">{{ lead.rating.name }}</p>
                            <p class="text-weak text-xs">Rating</p>
                        </div>
                    </template>

                    <template v-if="lead.status">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex flex-col">
                            <p class="text-weak font-semibold capitalize">{{ lead.status.name }}</p>
                            <p class="text-weak text-xs">Status</p>
                        </div>
                    </template>

                    <template v-if="lead.user">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex items-center gap-2">
                            <UAvatar :src="lead.user.photo ?? '/images/avatar-fallback.jpg'" />
                            <div>
                                <p class="font-semibold">{{ `${lead.user.first_name} ${lead.user.last_name}` }}</p>
                                <p class="text-xs">Owner</p>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </header>

        <section class="m-4 grid gap-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <p v-if="lead?.status?.name === 'disqualified' && lead.disqualify_reason" class="rounded-lg bg-red-100 p-4">
                    This lead is disqualified because
                    <span class="font-semibold capitalize">{{ lead.disqualify_reason.name }}.</span>
                </p>

                <UCard>
                    <template #header>
                        <h2 class="text-xl font-semibold">TOPIC</h2>
                    </template>

                    <UButton
                        variant="ghost"
                        color="black"
                        class="flex items-center gap-[10px]"
                        @click="
                            modal.open(LazyModalAddLeadTopic, {
                                onClose: () => modal.close(),
                                lead: { id: lead!.id, topic: lead!.topic },
                            })
                        "
                    >
                        <template v-if="lead?.topic">
                            {{ lead.topic }}
                        </template>
                        <template v-else>
                            <UIcon name="i-heroicons-pencil" class="h-4 w-4" />
                            <span class="text-weak">Enter description about this lead...</span>
                        </template>
                    </UButton>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">TASK <span class="text-weak">0</span></h2>
                            <UButton icon="i-heroicons-plus" variant="ghost" square color="black" />
                        </div>
                    </template>

                    <UButton variant="ghost" color="black" class="text-weak"> Add New Task </UButton>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">CONTACT</h2>
                            <UButton v-if="!lead?.contact?.is_valid_email" variant="outline">Verify Email</UButton>
                        </div>
                    </template>

                    <div v-if="lead?.contact" class="flex gap-6 text-sm sm:text-base">
                        <div class="text-weak grid shrink-0 grid-rows-11 gap-y-8">
                            <p>Email</p>
                            <p>First Name</p>
                            <p>Last Name</p>
                            <p>Job Title</p>
                            <p>Mobile Phone</p>
                            <p>Whatsapp</p>
                            <p>LinkedIn URL</p>
                            <!-- <p>Preferred Method of Contact</p> -->
                        </div>

                        <div class="grid grow grid-rows-11 gap-y-8 font-semibold">
                            <p class="line-clamp-1">{{ lead.contact.email ?? '---' }}</p>
                            <p class="line-clamp-1">{{ lead.contact.first_name ?? '---' }}</p>
                            <p class="line-clamp-1">{{ lead.contact.last_name ?? '---' }}</p>
                            <p class="line-clamp-1">{{ lead.contact.job_title ?? '---' }}</p>
                            <p class="line-clamp-1">{{ lead.contact.mobile_phone ?? '---' }}</p>
                            <p class="line-clamp-1">{{ lead.contact.whatsapp ?? '---' }}</p>
                            <NuxtLink
                                v-if="lead.contact.linkedin"
                                :href="lead.contact.linkedin"
                                external
                                class="line-clamp-1 text-brand"
                                >{{ lead.contact.linkedin }}</NuxtLink
                            >
                        </div>
                    </div>
                </UCard>
            </div>
        </section>
    </div>
</template>

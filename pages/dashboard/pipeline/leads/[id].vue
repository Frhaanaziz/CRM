<script lang="ts" setup>
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignLead from '~/components/modal/ModalAssignLead.vue';
import LazyModalAddLeadTopic from '~/components/modal/ModalAddLeadTopic.vue';
import type { DisqualifyReason, LeadStatuses } from '~/types';
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { user } = storeToRefs(userSessionStore());
const organization_id = user.value?.user_metadata?.organization_id;
if (!user.value || !organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const { data: disqualifyReasons } = await useLazyFetch('/api/disqualify-reasons', {
    key: 'disqualify-reasons',
});
const { data: lead } = await useFetch(`/api/leads/${id}`, {
    key: `leads-${id}`,
});
if (!lead.value) throw createError({ status: 404, message: 'Lead not found' });

const isUpdatingStatus = ref(false);
const isCreatingTask = ref(false);

const contactForm = ref<null | {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}>(null);
const submitContactForm = () => contactForm.value?.submitForm();
const resetContactForm = () => contactForm.value?.resetForm();
const isContactFormDirty = computed(() => contactForm.value?.isFormDirty);
const isUpdatingContact = computed(() => contactForm.value?.isUpdating);

const companyForm = ref<null | {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}>(null);
const submitCompanyForm = () => companyForm.value?.submitForm();
const resetCompanyForm = () => companyForm.value?.resetForm();
const isCompanyFormDirty = computed(() => companyForm.value?.isFormDirty);
const isUpdatingCompany = computed(() => companyForm.value?.isUpdating);

const { taskState, isSubmittingTask, handleSubmitTask } = useTask();

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
            body: JSON.stringify({ id }),
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
        await refreshNuxtData('leads');
        await navigateTo('/dashboard/pipeline/leads');
    } catch (e) {
        console.error('Failed to delete Lead:', e);
        toast.error('Failed to delete Lead, please try again later.');
    }
}
function useTask() {
    type AddTaskType = z.infer<typeof addTaskSchema>;
    const isSubmitting = ref(false);
    const state = ref({
        description: '',
        date: new Date().toISOString(),
        lead_id: id,
        user_id: user.value!.id,
        organization_id,
    });

    async function createTask(event: FormSubmitEvent<AddTaskType>) {
        try {
            isSubmitting.value = true;

            await $fetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            toast.success('Task added successfully.');
            await refreshNuxtData(`lead-${id}`);
            state.value = { ...state.value, description: '', date: new Date().toISOString() };
            isCreatingTask.value = false;
        } catch (e) {
            console.error('Failed to add task', e);
            toast.error('Failed to add task, please try again later.');
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        taskState: state,
        isSubmittingTask: isSubmitting,
        handleSubmitTask: createTask,
    };
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
                    <UAvatar :src="getUserFallbackAvatarUrl(lead.contact)" size="md" />
                    <div v-if="lead.contact && lead.company" class="flex flex-col gap-1">
                        <h1 class="text-xl font-semibold">
                            {{ getUserFullName(lead.contact) }}
                        </h1>
                        <p class="text-sm">{{ lead.contact.job_title }} &#128900; {{ lead.company.name }}</p>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div v-if="lead.score" class="flex flex-col">
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
                            <p class="text-weak font-semibold capitalize">{{ lead.status }}</p>
                            <p class="text-weak text-xs">Status</p>
                        </div>
                    </template>

                    <template v-if="lead.user">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex items-center gap-2">
                            <UAvatar :src="lead.user.photo ?? getUserFallbackAvatarUrl(lead.user)" />
                            <div>
                                <p class="font-semibold">{{ getUserFullName(lead.user) }}</p>
                                <p class="text-xs">Owner</p>
                            </div>
                        </div>
                    </template>
                </div>
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
                        <template v-if="lead.topic">
                            {{ lead.topic }}
                        </template>
                        <template v-else>
                            <UIcon name="i-heroicons-pencil" class="h-4 w-4" />
                            <span class="text-weak">Enter description about this lead...</span>
                        </template>
                    </UButton>
                </UCard>

                <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">
                                TASK <span class="text-weak">({{ lead.tasks.length }})</span>
                            </h2>
                            <UButton
                                icon="i-heroicons-plus"
                                variant="ghost"
                                square
                                color="black"
                                @click="isCreatingTask = !isCreatingTask"
                            />
                        </div>
                    </template>

                    <div v-if="isCreatingTask" class="bg-brand-50 p-4">
                        <LazyUForm
                            :schema="addTaskSchema"
                            :state="taskState"
                            class="space-y-3"
                            @submit="handleSubmitTask"
                            @error="console.error"
                        >
                            <UFormGroup label="Task Description" name="description" required>
                                <UInput
                                    v-model="taskState.description"
                                    :disabled="isSubmittingTask"
                                    :loading="isSubmittingTask"
                                    placeholder="Enter company name"
                                />
                            </UFormGroup>

                            <UFormGroup label="Date" name="date" required>
                                <UInput
                                    v-model.date="taskState.date"
                                    type="datetime-local"
                                    :disabled="isSubmittingTask"
                                    :loading="isSubmittingTask"
                                />
                            </UFormGroup>

                            <div class="flex items-center justify-end gap-2">
                                <UButton
                                    type="button"
                                    variant="outline"
                                    :disabled="isSubmittingTask"
                                    @click="isCreatingTask = false"
                                    >Cancel</UButton
                                >
                                <UButton type="submit" :disabled="isSubmittingTask" :loading="isSubmittingTask">Save</UButton>
                            </div>
                        </LazyUForm>
                    </div>

                    <div v-if="!!lead.tasks?.length" class="divide-y">
                        <LazyCardTask v-for="task in lead.tasks" :key="task.id" :task="task" />
                    </div>
                    <UButton
                        v-else
                        variant="ghost"
                        color="black"
                        block
                        class="text-weak mx-2 mb-4 mt-1 justify-start"
                        @click="isCreatingTask = true"
                    >
                        Add New Task
                    </UButton>
                </UCard>

                <CardContactDetails v-if="lead && lead.contact" ref="contactForm" :contact="lead.contact" />

                <CardCompanyDetails v-if="lead && lead.company" ref="companyForm" :company="lead.company" />
            </div>

            <div class="md:col-span-8">
                <CardTimeline :lead_id="id" />
            </div>
        </section>
    </div>
</template>

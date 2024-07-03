<script lang="ts" setup>
import type { z } from 'zod';
import type { OpportunityStatus } from '~/types';
import { useRefHistory, useDateFormat } from '@vueuse/core';
import type { FormSubmitEvent } from '#ui/types';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignOpportunity from '~/components/modal/ModalAssignOpportunity.vue';
import LazyModalCloseOpportunityAsWon from '~/components/modal/ModalCloseOpportunityAsWon.vue';
import LazyModalCloseOpportunityAsLost from '~/components/modal/ModalCloseOpportunityAsLost.vue';
import LazyModalAddOpportunityTopic from '~/components/modal/ModalAddOpportunityTopic.vue';

const modal = useModal();
const id = useRoute().params.id as string;

const user = useSupabaseUser();
const organization_id = user.value?.user_metadata.organization_id;
if (!user.value || !organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const isUpdatingStatus = ref(false);
const isCreatingTask = ref(false);

const { data: opportunityStatuses } = await useLazyFetch(`/api/organizations/${organization_id}/opportunity-statuses`, {
    key: `organizations-${organization_id}-opportunity-statuses`,
});
const { data: opportunity, refresh: refreshOpportunity } = await useFetch(`/api/opportunities/${id}`, {
    key: `opportunities-${id}`,
});
if (!opportunity.value) throw createError({ status: 404, message: 'Opportunity not found' });

const wonStatus = computed(() => opportunityStatuses.value?.find((s) => s.name.toLowerCase() === 'won'));
const lostStatus = computed(() => opportunityStatuses.value?.find((s) => s.name.toLowerCase() === 'lost'));

const { taskState, isSubmittingTask, handleSubmitTask } = useTask();
const { updateState, isUpdating, updateOpportunity, formRef, submitForm, isFormDirty, resetForm } = useUpdateOpportunity();

async function reopenOpportunity(statusName: OpportunityStatus['name']) {
    const status = opportunityStatuses.value?.find((s) => s.name.toLowerCase() === statusName);
    if (!status) {
        console.error(`Opportunity status ${statusName} not found for organization ${organization_id}`);
        toast.error('Opportunity status not found');
        return;
    }

    try {
        isUpdatingStatus.value = true;

        await Promise.all([
            $fetch(`/api/opportunities/${id}/opportunity-status-id`, {
                method: 'PATCH',
                body: JSON.stringify({ id, opportunity_status_id: status.id }),
            }),
            $fetch(`/api/opportunities/${id}/close-reason-id`, {
                method: 'PATCH',
                body: JSON.stringify({ id, close_reason_id: null }),
            }),
            $fetch(`/api/opportunities/${id}/act-revenue`, {
                method: 'PATCH',
                body: JSON.stringify({ id, act_revenue: null }),
            }),
            $fetch(`/api/opportunities/${id}/act-close-date`, {
                method: 'PATCH',
                body: JSON.stringify({ id, act_close_date: null }),
            }),
        ]);

        modal.close();
        toast.success('Opportunity reopened successfully.');
        await refreshOpportunity();
    } catch (error) {
        console.error('Failed to reopen opportunity:', error);
        toast.error('Failed to reopen opportunity, please try again later.');
    } finally {
        isUpdatingStatus.value = false;
    }
}
async function handleDeleteOpportunity() {
    try {
        await $fetch(`/api/opportunities/${id}`, { method: 'DELETE' });

        toast.success('Opportunity has been deleted successfully.');
        await refreshNuxtData('opportunities');
        await navigateTo('/dashboard/pipeline/opportunities');
    } catch (e) {
        console.error('Failed to delete Opportunity:', e);
        toast.error('Failed to delete Opportunity, please try again later.');
    }
}
function useTask() {
    type AddTaskType = z.infer<typeof addTaskSchema>;
    const isSubmitting = ref(false);
    const state = ref({
        description: '',
        date: new Date().toISOString(),
        opportunity_id: id,
        user_id: user.value!.id,
    });

    async function createTask(event: FormSubmitEvent<AddTaskType>) {
        try {
            isSubmitting.value = true;

            await $fetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            toast.success('Task added successfully.');
            await refreshNuxtData(`opportunities-${id}`);
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
function useUpdateOpportunity() {
    type UpdateOpportunityType = z.infer<typeof updateOpportunitySchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const updateState = ref({
        id,
        act_close_date: opportunity.value!.act_close_date ?? undefined,
        currency_id: opportunity.value!.currency_id,
        act_budget: opportunity.value!.act_budget ?? undefined,
        est_revenue: opportunity.value!.est_revenue ?? undefined,
        payment_plan_id: opportunity.value!.payment_plan_id,
        confidence: opportunity.value!.confidence ?? undefined,
    });
    const { history, undo } = useRefHistory(updateState, { deep: true, capacity: 1 });
    const isDirty = computed(() => history.value.length > 1);
    const submit = async () => await formRef.value?.submit();

    const resetForm = () => {
        undo();
        formRef.value?.clear();
        updateState.value = {
            id,
            act_close_date: opportunity.value!.act_close_date ?? undefined,
            currency_id: opportunity.value!.currency_id,
            act_budget: opportunity.value!.act_budget ?? undefined,
            est_revenue: opportunity.value!.est_revenue ?? undefined,
            payment_plan_id: opportunity.value!.payment_plan_id,
            confidence: opportunity.value!.confidence ?? undefined,
        };
    };

    async function updateOpportunity(event: FormSubmitEvent<UpdateOpportunityType>) {
        try {
            isUpdating.value = true;

            await new Promise((resolve) => setTimeout(resolve, 1000));
            // await $fetch('/api/companies', {
            //     method: 'POST',
            //     body: JSON.stringify(event.data),
            // });

            toast.success('Opportunity updated successfully.');
            undo();
            await refreshOpportunity();
        } catch (e) {
            console.error('Failed to update opportunity', e);
            toast.error('Failed to update opportunity, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { updateState, isUpdating, updateOpportunity, formRef, submitForm: submit, isFormDirty: isDirty, resetForm };
}
</script>

<template>
    <div v-if="opportunity" class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/pipeline/opportunities" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>

                <template v-if="!(opportunity.status?.name === 'won' || opportunity.status?.name === 'lost')">
                    <!-- Qualify Button -->
                    <UButton
                        v-if="wonStatus"
                        label="Close As Won"
                        variant="ghost"
                        color="black"
                        class="font-semibold"
                        :loading="isUpdatingStatus"
                        :disabled="isUpdatingStatus"
                        @click="
                            modal.open(LazyModalCloseOpportunityAsWon, {
                                onClose: () => modal.close(),
                                opportunity,
                                wonStatus,
                            })
                        "
                    >
                        <template #leading>
                            <UIcon name="i-heroicons-check" class="h-5 w-5 text-green-700" />
                        </template>
                    </UButton>

                    <UButton
                        v-if="lostStatus"
                        label="Close As Lost"
                        variant="ghost"
                        color="black"
                        class="font-semibold"
                        :loading="isUpdatingStatus"
                        :disabled="isUpdatingStatus"
                        @click="
                            modal.open(LazyModalCloseOpportunityAsLost, {
                                onClose: () => modal.close(),
                                opportunity,
                                lostStatus,
                            })
                        "
                    >
                        <template #leading>
                            <UIcon name="i-heroicons-x-mark" class="h-5 w-5 text-red-700" />
                        </template>
                    </UButton>
                </template>
                <template v-else>
                    <UPopover>
                        <UButton
                            label="Reopen Opportunity"
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

                        <template v-if="opportunityStatuses" #panel="{ close }">
                            <div class="flex w-56 flex-col p-1">
                                <button
                                    v-for="status in opportunityStatuses?.filter(
                                        ({ name }) => !(name === 'won' || name === 'lost')
                                    )"
                                    :key="status.id"
                                    class="rounded p-2 text-start text-sm capitalize hover:bg-brand-50"
                                    :disabled="isUpdatingStatus"
                                    @click="
                                        () => {
                                            close();
                                            reopenOpportunity(status.name);
                                        }
                                    "
                                >
                                    {{ status.name }}
                                </button>
                            </div>
                        </template>
                    </UPopover>
                </template>

                <UButton
                    variant="ghost"
                    icon="i-heroicons-user"
                    color="black"
                    class="font-semibold"
                    @click="
                        modal.open(LazyModalAssignOpportunity, {
                            onClose: () => modal.close(),
                            opportunity: { id: opportunity!.id },
                            userId: opportunity!.user_id,
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
                            title: 'Opportunity',
                            description: 'Are you sure you want to delete this opportunity? This action cannot be undone.',
                            onConfirm: handleDeleteOpportunity,
                        })
                    "
                >
                    Delete
                </UButton>

                <template v-if="isFormDirty">
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-arrow-path"
                        color="black"
                        class="font-semibold"
                        :disabled="isUpdating"
                        @click="resetForm"
                    >
                        Reset
                    </UButton>
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-bookmark"
                        color="black"
                        class="font-semibold"
                        :disabled="isUpdating"
                        @click="submitForm"
                    >
                        Save
                    </UButton>
                </template>
            </div>

            <div class="flex items-center justify-between p-4">
                <div v-if="opportunity.company" class="flex flex-col gap-1">
                    <h1 class="text-xl font-semibold">
                        {{ opportunity.topic }}
                    </h1>
                    <p class="text-sm">Opportunity &#128900; {{ opportunity.company.name }}</p>
                </div>

                <div class="flex items-center gap-4">
                    <div v-if="opportunity.act_close_date" class="flex flex-col">
                        <p class="text-weak font-semibold capitalize">
                            {{ useDateFormat(opportunity.act_close_date, 'DD/MM/YYYY').value.replace('"', '') }}
                        </p>
                        <p class="text-weak text-xs">Close Date</p>
                    </div>

                    <template v-if="opportunity.act_revenue">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex flex-col">
                            <p class="text-weak font-semibold capitalize">{{ formatToRupiah(opportunity.act_revenue) }}</p>
                            <p class="text-weak text-xs">Act. Revenue</p>
                        </div>
                    </template>

                    <template v-if="opportunity.status">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex flex-col">
                            <p class="text-weak font-semibold capitalize">{{ opportunity.status.name }}</p>
                            <p class="text-weak text-xs">Status</p>
                        </div>
                    </template>

                    <template v-if="opportunity.user">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex items-center gap-2">
                            <UAvatar :src="opportunity.user.photo ?? '/images/avatar-fallback.jpg'" />
                            <div>
                                <p class="font-semibold">{{ `${opportunity.user.first_name} ${opportunity.user.last_name}` }}</p>
                                <p class="text-xs">Owner</p>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </header>

        <section class="grid gap-4 p-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <p
                    v-if="opportunity.status?.name === 'lost' && opportunity.close_reason"
                    class="text-weak rounded-lg bg-red-100 p-4"
                >
                    This opportunity is lost because
                    <span class="font-semibold capitalize">{{ opportunity.close_reason.name }}.</span>
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
                            modal.open(LazyModalAddOpportunityTopic, {
                                onClose: () => modal.close(),
                                opportunity,
                            })
                        "
                    >
                        {{ opportunity.topic }}
                    </UButton>
                </UCard>

                <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">
                                TASK <span class="text-weak">({{ opportunity?.tasks.length }})</span>
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
                        <UForm
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
                        </UForm>
                    </div>

                    <div v-if="!!opportunity.tasks?.length" class="divide-y">
                        <CardTask v-for="task in opportunity.tasks" :key="task.id" :task="task" />
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

                <UCard>
                    <template #header>
                        <h2 class="text-xl font-semibold">KEY DETAILS</h2>
                    </template>

                    <div v-if="opportunity" class="flex gap-6 text-sm sm:text-base">
                        <div class="text-weak grid shrink-0 grid-rows-8 gap-y-8">
                            <p>Company</p>
                            <p>Contact</p>
                            <p>Est. Close Date</p>
                            <p>Currency</p>
                            <p>Budget Amount</p>
                            <p>Est. Revenue</p>
                            <p>Payment Plans</p>
                            <p>Confidence</p>
                        </div>

                        <UForm
                            ref="formRef"
                            :schema="updateOpportunitySchema"
                            :state="updateState"
                            class="grid grow grid-rows-8 gap-y-8 font-semibold"
                            :disabled="isUpdating"
                            @submit="updateOpportunity"
                            @error="console.error"
                        >
                            <p class="line-clamp-1">{{ opportunity.company?.name ?? '---' }}</p>
                            <p class="line-clamp-1">
                                {{
                                    `${opportunity.contact?.first_name ?? ''} ${opportunity.contact?.last_name ?? ''}`.trim() ||
                                    '---'
                                }}
                            </p>
                            <p class="line-clamp-1">
                                {{
                                    opportunity.act_close_date
                                        ? useDateFormat(opportunity.act_close_date, 'DD/MM/YYYY').value.replace('"', '')
                                        : '---'
                                }}
                            </p>
                            <p class="line-clamp-1">{{ opportunity.currency?.name ?? '---' }}</p>
                            <p class="line-clamp-1">
                                {{ opportunity.act_budget ? formatToRupiah(opportunity.act_budget) : '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ opportunity.est_revenue ? formatToRupiah(opportunity.est_revenue) : '---' }}
                            </p>
                            <p class="line-clamp-1">{{ opportunity.payment_plan?.name ?? '---' }}</p>
                            <p class="line-clamp-1">{{ opportunity.confidence ? `${opportunity.confidence}%` : '---' }}</p>
                            <!-- 
                            <UFormGroup name="email">
                                <UInput v-model="updateState.email" variant="none" :padded="false" />
                            </UFormGroup>-->
                        </UForm>
                    </div>
                </UCard>
            </div>
        </section>
    </div>
</template>

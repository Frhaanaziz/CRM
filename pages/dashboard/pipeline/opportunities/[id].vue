<script lang="ts" setup>
import type { z } from 'zod';
import type { OpportunityStatus, PriorityStatuses } from '~/types';
import { useDateFormat, useRefHistory } from '@vueuse/core';
import type { FormSubmitEvent } from '#ui/types';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignOpportunity from '~/components/modal/ModalAssignOpportunity.vue';
import LazyModalCloseOpportunityAsWon from '~/components/modal/ModalCloseOpportunityAsWon.vue';
import LazyModalCloseOpportunityAsLost from '~/components/modal/ModalCloseOpportunityAsLost.vue';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { user } = storeToRefs(userSessionStore());
const organization_id = user.value?.user_metadata.organization_id;
if (!user.value || !organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const isUpdatingStatus = ref(false);
const isUpdatingPriority = ref(false);

const { data: opportunityStatuses } = await useLazyFetch(`/api/opportunity-statuses`, {
    key: `opportunity-statuses`,
    headers: useRequestHeaders(['cookie']),
});
const { data: opportunity, refresh: refreshOpportunity } = await useFetch(`/api/opportunities/${id}`, {
    key: `opportunities-${id}`,
    headers: useRequestHeaders(['cookie']),
});
if (!opportunity.value) throw createError({ status: 404, message: 'Opportunity not found' });

const wonStatus = computed(() => opportunityStatuses.value?.find((s) => s.name.toLowerCase() === 'won'));
const lostStatus = computed(() => opportunityStatuses.value?.find((s) => s.name.toLowerCase() === 'lost'));

const {
    moreInfoState,
    formRef: moreInfoForm,
    isFormDirty: isMoreInfoFormDirty,
    isUpdatingMoreInfo,
    resetForm: resetMoreInfoForm,
    submitForm: submitMoreInfo,
    updateMoreInfo,
} = useUpdateMoreInfo();

const opportunityForm = ref<null | {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}>(null);

async function reopenOpportunity(statusName: OpportunityStatus['name']) {
    const status = opportunityStatuses.value?.find((s) => s.name.toLowerCase() === statusName);
    if (!status) {
        console.error(`Opportunity status ${statusName} not found for organization ${organization_id}`);
        toast.error('Opportunity status not found');
        return;
    }

    try {
        isUpdatingStatus.value = true;

        await $fetch(`/api/opportunities/${id}/reopen`, {
            method: 'POST',
            body: JSON.stringify({ id, opportunity_status_id: status.id }),
        });

        modal.close();
        toast.success('Opportunity reopened successfully.');
        await refreshNuxtData();
    } catch (error) {
        console.error('Failed to reopen opportunity:', error);
        toast.error('Failed to reopen opportunity, please try again later.');
    } finally {
        isUpdatingStatus.value = false;
    }
}
async function updateStatus(opportunity_status_id: OpportunityStatus['id']) {
    try {
        isUpdatingStatus.value = true;

        await $fetch(`/api/opportunities/${id}/opportunity-status-id`, {
            method: 'PATCH',
            body: JSON.stringify({ id, opportunity_status_id }),
        });

        modal.close();
        toast.success('Opportunity status updated successfully.');
        await refreshOpportunity();
    } catch (error) {
        console.error('Failed to update opportunity status:', error);
        toast.error('Failed to update opportunity status, please try again later.');
    } finally {
        isUpdatingStatus.value = false;
    }
}
async function deleteOpportunity() {
    try {
        await $fetch(`/api/opportunities/${id}`, { method: 'DELETE' });

        toast.success('Opportunity has been deleted successfully.');
        await refreshNuxtData();
        await navigateTo('/dashboard/pipeline/opportunities');
    } catch (e) {
        console.error('Failed to delete Opportunity:', e);
        toast.error('Failed to delete Opportunity, please try again later.');
    }
}
async function updatePriority(priority: PriorityStatuses) {
    try {
        isUpdatingPriority.value = true;

        await $fetch(`/api/opportunities/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ id, priority }),
        });

        toast.success('Priority updated successfully.');
        await refreshOpportunity();
    } catch (error) {
        console.error('Failed to update priority:', error);
        toast.error('Failed to update priority, please try again later.');
    } finally {
        isUpdatingPriority.value = false;
    }
}
function useUpdateMoreInfo() {
    type UpdateMoreInfoType = z.infer<typeof updateOpportunitySchema>;

    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        id: opportunity.value?.id,
        current_situation: opportunity.value?.current_situation ?? '',
        customer_need: opportunity.value?.customer_need ?? '',
        proposed_solution: opportunity.value?.proposed_solution ?? '',
    };
    const updateState = ref({ ...initialState });
    const { history, clear } = useRefHistory(updateState, { deep: true });
    const isDirty = computed(() => history.value.length > 1);
    const submit = async () => await formRef.value?.submit();

    const resetForm = async () => {
        formRef.value?.clear();
        updateState.value = { ...initialState };
        await nextTick();
        clear();
    };

    async function updateMoreInfo(event: FormSubmitEvent<UpdateMoreInfoType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/opportunities/${id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Opportunity updated successfully.');
            clear();
            await refreshOpportunity();
        } catch (e) {
            console.error('Failed to update more info', e);
            toast.error('Failed to update more info, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return {
        moreInfoState: updateState,
        isUpdatingMoreInfo: isUpdating,
        updateMoreInfo,
        formRef,
        submitForm: submit,
        isFormDirty: isDirty,
        resetForm,
    };
}
</script>

<template>
    <div v-if="opportunity" class="min-h-screen bg-base-200">
        <header class="sticky top-16 z-10 bg-base-100 shadow lg:top-0">
            <div class="flex items-center overflow-x-auto border-b">
                <NuxtLink
                    href="/dashboard/pipeline/opportunities"
                    class="flex h-10 w-10 shrink-0 items-center justify-center border"
                >
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
                            onConfirm: deleteOpportunity,
                        })
                    "
                >
                    Delete
                </UButton>

                <LazyUButton
                    v-if="opportunityForm?.isFormDirty || isMoreInfoFormDirty"
                    variant="ghost"
                    icon="i-heroicons-arrow-path"
                    color="black"
                    class="font-semibold"
                    :disabled="opportunityForm?.isUpdating"
                    @click="
                        () => {
                            opportunityForm?.resetForm();
                            resetMoreInfoForm();
                        }
                    "
                >
                    Reset
                </LazyUButton>

                <LazyUButton
                    v-if="opportunityForm?.isFormDirty"
                    variant="ghost"
                    icon="i-heroicons-bookmark"
                    color="black"
                    class="font-semibold"
                    :disabled="opportunityForm?.isUpdating"
                    @click="opportunityForm?.submitForm"
                >
                    Save
                </LazyUButton>

                <LazyUButton
                    v-if="isMoreInfoFormDirty"
                    variant="ghost"
                    icon="i-heroicons-bookmark"
                    color="black"
                    class="font-semibold"
                    :disabled="isUpdatingMoreInfo"
                    @click="submitMoreInfo"
                >
                    Save More Info
                </LazyUButton>
            </div>

            <div class="flex items-center justify-between gap-x-6 overflow-x-auto p-4">
                <h1 class="shrink-0 text-xl font-semibold">
                    {{ opportunity.lead?.company?.name }}
                </h1>

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

                        <LazyUPopover>
                            <button
                                class="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                :disabled="isUpdatingStatus"
                            >
                                <div class="flex flex-col text-start">
                                    <p class="text-weak font-semibold capitalize">{{ opportunity.status.name }}</p>
                                    <p class="text-weak text-xs">Status</p>
                                </div>

                                <UIcon name="i-heroicons-chevron-down-solid" class="-ml-1 mt-1.5 self-start" />
                            </button>

                            <template #panel="{ close }">
                                <div class="flex w-56 flex-col p-1">
                                    <button
                                        v-for="status in opportunityStatuses?.filter(
                                            ({ name }) =>
                                                !(name === 'won' || name === 'lost' || name === opportunity?.status?.name)
                                        )"
                                        :key="status.id"
                                        class="rounded p-2 text-start text-sm capitalize hover:bg-brand-50"
                                        :disabled="isUpdatingStatus"
                                        @click="
                                            () => {
                                                close();
                                                updateStatus(status.id);
                                            }
                                        "
                                    >
                                        {{ status.name }}
                                    </button>
                                </div>
                            </template>
                        </LazyUPopover>
                    </template>

                    <template v-if="opportunity.priority">
                        <div class="h-10 border-r border-base-300" />

                        <LazyUPopover>
                            <button
                                class="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                :disabled="isUpdatingPriority"
                            >
                                <UAvatar :src="`/icons/priority-${opportunity.priority}.png`" />

                                <div class="flex flex-col text-start">
                                    <p class="text-weak font-semibold capitalize">{{ opportunity.priority }}</p>
                                    <p class="text-weak text-xs">Priority</p>
                                </div>

                                <UIcon name="i-heroicons-chevron-down-solid" class="-ml-1 mt-1.5 self-start" />
                            </button>

                            <template #panel="{ close }">
                                <div class="flex w-56 flex-col p-1">
                                    <button
                                        v-for="status in priorityStatuses?.filter((status) => status !== opportunity?.priority)"
                                        :key="status"
                                        class="flex items-center gap-2 rounded p-2 text-start text-sm capitalize hover:bg-brand-50"
                                        :disabled="isUpdatingPriority"
                                        @click="
                                            () => {
                                                close();
                                                updatePriority(status);
                                            }
                                        "
                                    >
                                        <UAvatar :src="`/icons/priority-${status}.png`" size="xs" />
                                        {{ status }}
                                    </button>
                                </div>
                            </template>
                        </LazyUPopover>
                    </template>

                    <template v-if="opportunity.user">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex items-center gap-2">
                            <UAvatar :src="opportunity.user.photo ?? getFallbackAvatarUrl(getUserFullName(opportunity.user))" />
                            <div class="shrink-0">
                                <p class="font-semibold">{{ getUserFullName(opportunity.user) }}</p>
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
                    <span class="font-semibold capitalize">{{ opportunity.close_reason }}.</span>
                </p>

                <CardTasks v-if="opportunity.tasks" :tasks="opportunity.tasks" :oportunity_id="id" />

                <CardOpportunityDetails ref="opportunityForm" :opportunity />

                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-slate-700">More Info</h2>
                    </template>

                    <UForm
                        ref="moreInfoForm"
                        :schema="updateOpportunitySchema"
                        :state="moreInfoState"
                        :disabled="isUpdatingMoreInfo"
                        class="space-y-2 pl-2"
                        @submit="updateMoreInfo"
                        @error="console.error"
                    >
                        <UFormGroup label="Current Situation" name="current_situation">
                            <UTextarea
                                v-model="moreInfoState.current_situation"
                                autoresize
                                :rows="1"
                                placeholder="---"
                                :ui="{
                                    color: {
                                        white: {
                                            outline: 'ring-0 shadow-none hover:ring-1 ',
                                        },
                                    },
                                }"
                            />
                        </UFormGroup>

                        <UFormGroup label="Customer Need" name="customer_need">
                            <UTextarea
                                v-model="moreInfoState.customer_need"
                                autoresize
                                :rows="1"
                                placeholder="---"
                                :ui="{
                                    color: {
                                        white: {
                                            outline: 'ring-0 shadow-none hover:ring-1 ',
                                        },
                                    },
                                }"
                            />
                        </UFormGroup>

                        <UFormGroup label="Proposed Solution" name="proposed_solution">
                            <UTextarea
                                v-model="moreInfoState.proposed_solution"
                                autoresize
                                :rows="1"
                                placeholder="---"
                                :ui="{
                                    color: {
                                        white: {
                                            outline: 'ring-0 shadow-none hover:ring-1 ',
                                        },
                                    },
                                }"
                            />
                        </UFormGroup>
                    </UForm>
                </UCard>
            </div>

            <div class="md:col-span-8">
                <CardTimeline :opportunity_id="id" />
            </div>
        </section>
    </div>
</template>

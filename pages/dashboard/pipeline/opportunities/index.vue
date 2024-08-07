<script setup lang="ts">
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import type { Opportunity } from '~/types';
import LazyModalAddOpportunity from '~/components/modal/ModalAddOpportunity.vue';
import LazyModalOpportunityPipelines from '~/components/modal/ModalOpportunityPipelines.vue';
import { useDateFormat } from '@vueuse/core';
import Draggable from 'vuedraggable';

const modal = useModal();

const { data: opportunityStatuses } = await useFetch('/api/opportunity-statuses', {
    key: 'opportunity-statuses',
    headers: useRequestHeaders(['cookie']),
});
const {
    data: opportunities,
    status,
    refresh: refreshOpportunities,
} = await useFetch('/api/opportunities', {
    key: 'opportunities',
    headers: useRequestHeaders(['cookie']),
    default: () => [],
});

const viewMode = useCookie<'table' | 'kanban'>('opportunities-view-mode', {
    default: () => 'kanban',
});

const isReordering = ref(false);
const drag = ref(false);

const dragOptions = computed(() => ({
    animation: 200,
    disabled: isReordering.value,
    ghostClass: 'opacity-50',
}));

const {
    columns,
    selectedColumns,
    tableColumns,
    selectedRows,
    select,
    opportunitiesRows,
    search,
    page,
    pageCount,
    sort,
    pageTotal,
} = useTable();

const sortedOpportunitiesByStatus = computed(() => {
    const groupedOpportunities = opportunities.value.reduce(
        (acc, opportunity) => {
            if (!acc[opportunity.status!.id]) {
                acc[opportunity.status!.id] = [];
            }
            acc[opportunity.status!.id].push(opportunity);
            return acc;
        },
        {} as Record<string, Opportunity[]>
    );

    const sortedOpportunities = Object.entries(groupedOpportunities).reduce(
        (acc, [statusId, opportunities]) => {
            acc[statusId] = opportunities.sort((a, b) => b.index_number - a.index_number);
            return acc;
        },
        {} as Record<string, Opportunity[]>
    );

    // Add empty arrays for missing status ids
    opportunityStatuses.value!.forEach((status) => {
        if (!sortedOpportunities[status.id]) {
            sortedOpportunities[status.id] = [];
        }
    });

    return sortedOpportunities;
});

async function onAdd({ newIndex, to }: { newIndex: number; to: { id: string } }) {
    try {
        isReordering.value = true;

        const newOpportunityStatusId = to.id;

        // index_number of the task above the dragged and dropped task
        const prevElIndexNumber = sortedOpportunitiesByStatus.value[newOpportunityStatusId][newIndex - 1]?.index_number;
        // index_number of the task under the dragged and dropped task
        const nextElIndexNumber = sortedOpportunitiesByStatus.value[newOpportunityStatusId][newIndex + 1]?.index_number;

        await $fetch(
            `/api/opportunities/${sortedOpportunitiesByStatus.value[newOpportunityStatusId][newIndex].id}/opportunity-status-id`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    id: sortedOpportunitiesByStatus.value[newOpportunityStatusId][newIndex].id,
                    opportunity_status_id: newOpportunityStatusId,
                    prevElIndexNumber,
                    nextElIndexNumber,
                }),
            }
        );
        await refreshOpportunities();
    } catch (error) {
        console.error('Error updating opportunity status:', error);
        toast.error('Failed to reorder opportunity status, please try again later.');
    } finally {
        isReordering.value = false;
    }
}
async function onUpdate({ newIndex, to }: { newIndex: number; to: { id: string } }) {
    try {
        isReordering.value = true;

        const opportunityStatusId = to.id;

        // index_number of the task above the dragged and dropped task
        const prevElIndexNumber = sortedOpportunitiesByStatus.value[opportunityStatusId][newIndex - 1]?.index_number;
        // index_number of the task under the dragged and dropped task
        const nextElIndexNumber = sortedOpportunitiesByStatus.value[opportunityStatusId][newIndex + 1]?.index_number;

        await $fetch(`/api/opportunities/${sortedOpportunitiesByStatus.value[opportunityStatusId][newIndex].id}/reorder`, {
            method: 'POST',
            body: JSON.stringify({
                prevElIndexNumber,
                nextElIndexNumber,
            }),
        });
        await refreshOpportunities();
    } catch (error) {
        console.error('Error updating opportunity status:', error);
        toast.error('Failed to reorder opportunity status, please try again later.');
    } finally {
        isReordering.value = false;
    }
}
async function handleDeleteOpportunities(opportunities: Pick<Opportunity, 'id'>[]) {
    try {
        await Promise.all(
            opportunities.map((opportunity) => $fetch(`/api/opportunities/${opportunity.id}`, { method: 'DELETE' }))
        );

        toast.success('Opportunity has been deleted successfully.');
        await refreshOpportunities();
    } catch (e) {
        console.error('Failed to delete Opportunity:', e);
        toast.error('Failed to delete Opportunity, please try again later.');
    }
}
function useTable() {
    const columns = [
        {
            key: 'lead(company(name))',
            label: 'Company',
            sortable: true,
        },
        {
            key: 'contact(first_name)',
            label: 'Contact',
            sortable: true,
        },
        {
            key: 'status(name)',
            label: 'Status',
            sortable: true,
        },
        {
            key: 'user(first_name)',
            label: 'Lead Owner',
            sortable: true,
        },
        {
            key: 'est_budget',
            label: 'Est. Budget',
            sortable: true,
        },
        {
            key: 'est_revenue',
            label: 'Est. Revenue',
            sortable: true,
        },
        {
            key: 'act_budget',
            label: 'Act. Budget',
            sortable: true,
        },
        {
            key: 'act_revenue',
            label: 'Act. Revenue',
            sortable: true,
        },
        {
            key: 'act_close_date',
            label: 'Act. Close Date',
            sortable: true,
        },
        {
            key: 'confidence',
            label: 'Probability',
            sortable: true,
        },
        {
            key: 'rating(name)',
            label: 'Rating',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['lead(company(name))', 'contact(first_name)', 'status(name)', 'user(first_name)', 'created_at'];
    const selectedColumns = ref(columns.filter((column) => initialColumnKeys.includes(column.key)));
    const tableColumns = computed(() =>
        columns.filter((column) => selectedColumns.value.some((selected) => selected.key === column.key))
    );

    // Selected Rows
    const selectedRows = ref<Pick<Opportunity, 'id'>[]>([]);
    function select(row: Pick<Opportunity, 'id'>) {
        const index = selectedRows.value.findIndex((item) => item.id === row.id);
        if (index === -1) {
            selectedRows.value.push(row);
        } else {
            selectedRows.value.splice(index, 1);
        }
    }

    const {
        filteredData: filteredOpportunities,
        search,
        page,
        pageCount,
        sort,
        pageTotal,
        resetFilters,
    } = useFilterAndPaginate(opportunities);

    return {
        columns,
        selectedColumns,
        tableColumns,
        selectedRows,
        select,
        opportunitiesRows: filteredOpportunities,
        search,
        page,
        pageCount,
        sort,
        pageTotal,
        resetFilters,
    };
}
</script>

<template>
    <div>
        <header>
            <div class="flex items-center justify-between gap-x-3 p-4">
                <div class="space-y-1">
                    <h1 class="text-xl font-semibold text-slate-900">Opportunities</h1>
                    <p class="text-sm text-slate-500">{{ opportunities.length }} Result</p>
                </div>

                <div class="hidden sm:flex sm:items-center sm:gap-1.5">
                    <UButton
                        icon="i-heroicons-plus"
                        color="white"
                        @click="
                            modal.open(LazyModalAddOpportunity, {
                                onClose: () => modal.close(),
                            })
                        "
                    >
                        Add New Opportunity
                    </UButton>

                    <UInput v-model="search" placeholder="Search..." />
                </div>
            </div>
            <div class="flex items-center justify-between border px-4 py-2">
                <div class="flex items-center gap-4">
                    <UButtonGroup size="sm" orientation="horizontal">
                        <UButton
                            color="white"
                            square
                            icon="i-heroicons-bars-3"
                            :class="{ 'text-brand': viewMode === 'table' }"
                            @click="viewMode = 'table'"
                        />
                        <UButton
                            color="white"
                            square
                            icon="i-heroicons-squares-2x2"
                            :class="{ 'text-brand': viewMode === 'kanban' }"
                            @click="viewMode = 'kanban'"
                        />
                    </UButtonGroup>
                    <UButton
                        color="white"
                        leading-icon="i-heroicons-calendar-days"
                        trailing-icon="i-heroicons-chevron-down"
                        disabled
                    >
                        <span class="font-semibold">Expected:</span> All time
                    </UButton>
                    <UButton color="white" leading-icon="i-heroicons-user" trailing-icon="i-heroicons-chevron-down" disabled>
                        All User
                    </UButton>
                </div>

                <div class="flex items-center gap-4">
                    <LazyUButton
                        v-if="!!selectedRows.length"
                        icon="i-heroicons-trash"
                        color="white"
                        size="xs"
                        @click="
                            modal.open(LazyModalDelete, {
                                onClose: () => modal.close(),
                                title: 'Opportunities',
                                description: 'Are you sure you want to delete this opportunity? This action cannot be undone.',
                                onConfirm: () => handleDeleteOpportunities(selectedRows),
                            })
                        "
                    >
                        Delete
                    </LazyUButton>

                    <UButton
                        v-if="viewMode === 'kanban'"
                        icon="i-heroicons-adjustments-vertical"
                        color="white"
                        size="xs"
                        @click="
                            modal.open(LazyModalOpportunityPipelines, {
                                onClose: () => modal.close(),
                            })
                        "
                    >
                        Edit Columns
                    </UButton>

                    <LazyUSelectMenu
                        v-if="viewMode === 'table'"
                        v-model="selectedColumns"
                        :options="columns"
                        multiple
                        :uiMenu="{ width: 'min-w-32' }"
                    >
                        <UButton icon="i-heroicons-view-columns" color="white" size="xs"> Edit Columns </UButton>
                    </LazyUSelectMenu>
                </div>
            </div>
        </header>

        <section v-if="viewMode === 'table'">
            <LazyTableOpportunities
                v-model:page="page"
                v-model:pageCount="pageCount"
                v-model:sort="sort"
                v-model:selectedRows="selectedRows"
                :totalRows="pageTotal"
                :columns="tableColumns"
                :opportunitiesRows
                :pending="status === 'pending'"
                @select="select"
            />
        </section>

        <section v-else class="min-h-[calc(100vh-96px)] bg-base-200">
            <ul class="flex items-start gap-4 overflow-x-auto p-4">
                <li v-for="opportunityStatus in opportunityStatuses" :key="opportunityStatus.id" class="min-w-[392px]">
                    <div class="flex items-center justify-between rounded bg-base-100 px-4 py-2 shadow">
                        <h2 class="font-semibold capitalize">{{ opportunityStatus.name }}</h2>
                        <p class="text-xs text-slate-500">
                            {{ sortedOpportunitiesByStatus[opportunityStatus.id].length }} Result
                        </p>
                    </div>
                    <div class="flex items-center justify-between rounded-b bg-brand-800 px-4 py-2 text-xs text-white">
                        <p>Est. Value</p>
                        <p>
                            {{
                                formatToRupiah(
                                    sortedOpportunitiesByStatus[opportunityStatus.id].reduce(
                                        (acc, opportunity) => acc + (opportunity.est_revenue ?? 0),
                                        0
                                    )
                                )
                            }}
                        </p>
                    </div>

                    <Draggable
                        :id="opportunityStatus.id"
                        :list="sortedOpportunitiesByStatus[opportunityStatus.id]"
                        :component-data="{
                            tag: 'ul',
                            type: 'transition-group',
                            name: !drag ? 'flip-list' : null,
                        }"
                        item-key="id"
                        v-bind="dragOptions"
                        group="opportunities"
                        filter=".ignore-element"
                        @start="drag = true"
                        @end="drag = false"
                        @update="onUpdate"
                        @add="onAdd"
                    >
                        <template #item="{ element: opportunity }">
                            <li
                                class="mt-2 list-none rounded border bg-base-100 px-4 py-2"
                                :class="[isReordering ? 'cursor-not-allowed' : 'cursor-move']"
                            >
                                <div class="flex items-start justify-between gap-4">
                                    <div class="space-y-0.5">
                                        <NuxtLink
                                            :href="`/dashboard/pipeline/opportunities/${opportunity.id}`"
                                            class="ignore-element truncate font-semibold text-brand"
                                        >
                                            {{ opportunity.lead?.company?.name }}
                                        </NuxtLink>
                                        <p class="text-xs text-slate-600">{{ getUserFullName(opportunity.contact) }}</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <UButton
                                            variant="ghost"
                                            color="black"
                                            square
                                            icon="i-heroicons-pencil"
                                            size="xs"
                                            :padded="false"
                                            class="ignore-element"
                                            disabled
                                        />
                                        <UButton
                                            variant="ghost"
                                            color="black"
                                            square
                                            icon="i-heroicons-trash"
                                            size="xs"
                                            :padded="false"
                                            class="ignore-element"
                                            @click="
                                                modal.open(LazyModalDelete, {
                                                    onClose: () => modal.close(),
                                                    title: 'Opportunities',
                                                    description:
                                                        'Are you sure you want to delete this opportunity? This action cannot be undone.',
                                                    onConfirm: () => handleDeleteOpportunities([opportunity]),
                                                })
                                            "
                                        />
                                    </div>
                                </div>
                                <div class="py-2">
                                    <p class="text-sm font-semibold text-gray-900">
                                        {{ opportunity.est_revenue ? formatToRupiah(opportunity.est_revenue) : '---' }}
                                    </p>
                                    <p v-if="opportunity.confidence || opportunity.act_close_date" class="text-xs text-gray-700">
                                        {{ opportunity.confidence }}% on
                                        {{ useDateFormat(opportunity.est_close_date, 'DD-MM-YYYY').value.replace('"', '') }}
                                    </p>
                                </div>
                                <p v-if="opportunity.notes" class="py-2 text-sm text-gray-700">{{ opportunity.notes }}</p>
                            </li>
                        </template>
                    </Draggable>
                </li>
            </ul>
        </section>
    </div>
</template>

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
});
const {
    data: opportunities,
    status,
    refresh: refreshOpportunities,
} = await useFetch('/api/opportunities', {
    key: 'opportunities',
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
    resetFilters,
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
async function handleDeleteOpportunities() {
    try {
        await Promise.all(
            selectedRows.value.map((opportunity) => $fetch(`/api/opportunities/${opportunity.id}`, { method: 'DELETE' }))
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
            key: 'topic',
            label: 'Topic',
            sortable: true,
        },
        {
            key: 'companyName',
            label: 'Potential Cust.',
            sortable: true,
        },
        {
            key: 'estBudget',
            label: 'Est. Budget',
            sortable: true,
        },
        {
            key: 'estRevenue',
            label: 'Est. Revenue',
            sortable: true,
        },
        {
            key: 'actBudget',
            label: 'Act. Budget',
            sortable: true,
        },
        {
            key: 'actRevenue',
            label: 'Act. Revenue',
            sortable: true,
        },
        {
            key: 'actCloseDate',
            label: 'Act. Close Date',
            sortable: true,
        },
        {
            key: 'contactName',
            label: 'Contact',
            sortable: true,
        },
        {
            key: 'confidence',
            label: 'Probability',
            sortable: true,
        },
        {
            key: 'rating',
            label: 'Rating',
            sortable: true,
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['topic', 'companyName', 'estRevenue', 'actCloseDate', 'contactName', 'confidence', 'rating'];
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
        <header class="m-4 flex items-center justify-between gap-x-3 p-4">
            <h1 class="text-2xl font-semibold">All Opportunities</h1>

            <div class="hidden sm:flex sm:items-center sm:gap-1.5">
                <LazyUButton
                    v-if="!!selectedRows.length"
                    icon="i-heroicons-trash"
                    color="black"
                    size="xs"
                    variant="ghost"
                    @click="
                        modal.open(LazyModalDelete, {
                            onClose: () => modal.close(),
                            title: 'Opportunities',
                            description: 'Are you sure you want to delete this opportunity? This action cannot be undone.',
                            onConfirm: handleDeleteOpportunities,
                        })
                    "
                >
                    Delete
                </LazyUButton>

                <UButton
                    icon="i-heroicons-plus"
                    color="black"
                    size="xs"
                    variant="ghost"
                    @click="
                        modal.open(LazyModalAddOpportunity, {
                            onClose: () => modal.close(),
                        })
                    "
                >
                    New
                </UButton>

                <LazyUButton
                    v-if="viewMode === 'table'"
                    icon="i-heroicons-chart-bar-square"
                    color="black"
                    size="xs"
                    variant="ghost"
                    @click="viewMode = 'kanban'"
                >
                    See Sales Pipelines
                </LazyUButton>
                <UButton
                    v-else
                    icon="i-heroicons-list-bullet"
                    color="black"
                    size="xs"
                    variant="ghost"
                    @click="viewMode = 'table'"
                >
                    See Opportunity List
                </UButton>

                <!-- Edit Column Button -->
                <UButton
                    v-if="viewMode === 'kanban'"
                    icon="i-heroicons-adjustments-vertical"
                    color="black"
                    size="xs"
                    variant="ghost"
                    @click="
                        modal.open(LazyModalOpportunityPipelines, {
                            onClose: () => modal.close(),
                        })
                    "
                >
                    Edit Columns
                </UButton>

                <!-- Columns Selector -->
                <LazyUSelectMenu
                    v-if="viewMode === 'table'"
                    v-model="selectedColumns"
                    :options="columns"
                    multiple
                    :uiMenu="{ width: 'min-w-32' }"
                >
                    <UButton icon="i-heroicons-view-columns" color="black" size="xs" variant="ghost"> Columns </UButton>
                </LazyUSelectMenu>

                <!-- Reset Filters Button -->
                <LazyUButton
                    v-if="viewMode === 'table'"
                    icon="i-heroicons-funnel"
                    color="black"
                    size="xs"
                    :disabled="!!!search.length"
                    variant="ghost"
                    @click="resetFilters"
                >
                    Reset
                </LazyUButton>

                <LazyUInput
                    v-if="viewMode === 'table'"
                    v-model="search"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    placeholder="Search..."
                />
            </div>
        </header>

        <section v-if="viewMode === 'table'" class="m-4">
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
            <div class="flex items-start gap-4 overflow-x-auto p-4">
                <div
                    v-for="opportunityStatus in opportunityStatuses"
                    :key="opportunityStatus.id"
                    class="min-w-[392px] rounded bg-base-100 shadow"
                >
                    <div class="space-y-2 p-4">
                        <h2 class="text-xl font-semibold capitalize">{{ opportunityStatus.name }}</h2>
                        <p class="text-weak text-sm">3 OPPORTUNITIES</p>
                    </div>
                    <div class="flex items-center justify-between bg-brand-600 p-4 text-sm font-semibold text-white">
                        <p>Est. Annualized Value</p>
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
                        class="space-y-4 p-4"
                        @start="drag = true"
                        @end="drag = false"
                        @update="onUpdate"
                        @add="onAdd"
                    >
                        <template #item="{ element: opportunity }">
                            <li class="list-none rounded border" :class="[isReordering ? 'cursor-not-allowed' : 'cursor-move']">
                                <div class="flex items-center justify-between gap-4 border-b p-4">
                                    <NuxtLink
                                        :href="`/dashboard/pipeline/opportunities/${opportunity.id}`"
                                        class="ignore-element truncate font-semibold text-brand"
                                        >{{ opportunity.topic }}</NuxtLink
                                    >
                                    <UAvatar :src="`/icons/priority-${opportunity.priority}.png`" size="xs" />
                                </div>
                                <div class="flex items-center gap-4 p-4">
                                    <UAvatar :src="getFallbackAvatarUrl('FA')" size="md" />
                                    <div>
                                        <p class="text-weak">{{ getUserFullName(opportunity.contact) }}</p>
                                        <p v-if="opportunity.est_revenue" class="font-semibold">
                                            {{ formatToRupiah(opportunity.est_revenue) }}
                                        </p>
                                        <p v-if="opportunity.confidence || opportunity.act_close_date" class="text-weak">
                                            {{ opportunity.confidence }}% on
                                            {{ useDateFormat(opportunity.act_close_date!, 'YYYY-MM-DD').value }}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </template>
                    </Draggable>
                </div>
            </div>
        </section>
    </div>
</template>

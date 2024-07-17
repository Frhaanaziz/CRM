<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import type { Opportunity } from '~/types';
import LazyModalAddOpportunity from '~/components/modal/ModalAddOpportunity.vue';

const modal = useModal();

const { data: opportunities, status } = await useLazyFetch('/api/opportunities', {
    key: 'opportunities',
    default: () => [],
});
const pending = computed(() => status.value === 'pending');

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

async function handleDeleteOpportunities() {
    try {
        await Promise.all(
            selectedRows.value.map((opportunity) => $fetch(`/api/opportunities/${opportunity.id}`, { method: 'DELETE' }))
        );

        toast.success('Opportunity has been deleted successfully.');
        await refreshNuxtData('opportunities');
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
    <!-- Header and Action buttons -->
    <div class="flex items-center justify-between gap-x-3 p-4">
        <h1 class="text-2xl font-semibold">All Opportunities</h1>

        <div class="hidden sm:flex sm:items-center sm:gap-1.5">
            <UButton
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
            </UButton>

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

            <!-- Columns Selector -->
            <USelectMenu v-model="selectedColumns" :options="columns" multiple :uiMenu="{ width: 'min-w-32' }">
                <UButton icon="i-heroicons-view-columns" color="black" size="xs" variant="ghost"> Columns </UButton>
            </USelectMenu>

            <!-- Reset Filters Button -->
            <UButton
                icon="i-heroicons-funnel"
                color="black"
                size="xs"
                :disabled="!!!search.length"
                variant="ghost"
                @click="resetFilters"
            >
                Reset
            </UButton>

            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        by="id"
        :loading="pending"
        :rows="opportunitiesRows"
        :columns="tableColumns"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
        @select="select"
    >
        <template #topic-data="{ row }">
            <NuxtLink :href="`/dashboard/pipeline/opportunities/${row.id}`" class="text-brand hover:underline">
                {{ row.topic }}
            </NuxtLink>
        </template>

        <template #companyName-data="{ row }">
            <NuxtLink
                v-if="row.company"
                :href="`/dashboard/customer/companies/${row.company.id}`"
                class="text-brand hover:underline"
            >
                {{ row.company?.name }}
            </NuxtLink>
        </template>

        <template #estBudget-data="{ row }">
            {{ row.est_budget ? formatToRupiah(row.est_budget) : '' }}
        </template>

        <template #estRevenue-data="{ row }">
            {{ row.est_revenue ? formatToRupiah(row.est_revenue) : '' }}
        </template>

        <template #actBudget-data="{ row }">
            {{ row.act_budget ? formatToRupiah(row.act_budget) : '' }}
        </template>

        <template #actRevenue-data="{ row }">
            {{ row.act_revenue ? formatToRupiah(row.act_revenue) : '' }}
        </template>

        <template #actCloseDate-data="{ row }">
            {{ useDateFormat(row.act_close_date, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>

        <template #contactName-data="{ row }">
            <NuxtLink
                v-if="row.contact"
                :href="`/dashboard/customer/contacts/${row.contact.id}`"
                class="text-brand hover:underline"
            >
                {{ getUserFullName(row.contact) }}
            </NuxtLink>
        </template>

        <template #rating-data="{ row }">
            {{ row.rating.name }}
        </template>

        <template #status-data="{ row }">
            {{ row.status?.name }}
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>
        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No opportunities found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter v-model:page="page" v-model:pageCount="pageCount" :pageTotal="pageTotal" />
</template>

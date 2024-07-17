<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddLead from '~/components/modal/ModalAddLead.vue';
import type { Lead } from '~/types';

const modal = useModal();

const { data: leads, status } = await useLazyFetch('/api/leads', {
    key: 'leads',
    transform: (leads) =>
        leads.map((lead) => ({
            id: lead.id,
            name: getUserFullName(lead.contact),
            company: lead.company,
            score: lead.score,
            userName: getUserFullName(lead.user),
            status: lead.status,
            disqualify_reason: lead.disqualify_reason?.name,
            rating: lead.rating?.name,
            source: lead.source?.name,
            created_at: lead.created_at,
        })),
    default: () => [],
});
const pending = computed(() => status.value === 'pending');

const {
    columns,
    selectedColumns,
    tableColumns,
    selectedRows,
    select,
    leadsRows,
    search,
    page,
    pageCount,
    sort,
    pageTotal,
    resetFilters,
} = useTable();

async function handleDeleteLeads() {
    try {
        await Promise.all(selectedRows.value.map((lead) => $fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })));

        toast.success('Lead has been deleted successfully.');
        await refreshNuxtData('leads');
    } catch (e) {
        console.error('Failed to delete Lead:', e);
        toast.error('Failed to delete Lead, please try again later.');
    }
}
function useTable() {
    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
        },
        {
            key: 'companyName',
            label: 'Company',
            sortable: true,
        },
        {
            key: 'userName',
            label: 'Assigned To',
            sortable: true,
        },
        {
            key: 'score',
            label: 'Lead Score',
            sortable: true,
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
        },
        {
            key: 'disqualify_reason',
            label: 'Disqualify Reason',
            sortable: true,
        },
        {
            key: 'rating',
            label: 'Rating',
            sortable: true,
        },
        {
            key: 'source',
            label: 'Lead Source',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['name', 'companyName', 'score', 'status', 'rating', 'created_at'];
    const selectedColumns = ref(columns.filter((column) => initialColumnKeys.includes(column.key)));
    const tableColumns = computed(() =>
        columns.filter((column) => selectedColumns.value.some((selected) => selected.key === column.key))
    );

    // Selected Rows
    const selectedRows = ref<Pick<Lead, 'id'>[]>([]);
    function select(row: Pick<Lead, 'id'>) {
        const index = selectedRows.value.findIndex((item) => item.id === row.id);
        if (index === -1) {
            selectedRows.value.push(row);
        } else {
            selectedRows.value.splice(index, 1);
        }
    }

    const { filteredData: filteredLeads, search, page, pageCount, sort, pageTotal, resetFilters } = useFilterAndPaginate(leads);

    return {
        columns,
        selectedColumns,
        tableColumns,
        selectedRows,
        select,
        leadsRows: filteredLeads,
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
        <h1 class="text-2xl font-semibold">My Open Leads</h1>

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
                        title: 'Leads',
                        description: 'Are you sure you want to delete this lead? This action cannot be undone.',
                        onConfirm: handleDeleteLeads,
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
                    modal.open(LazyModalAddLead, {
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
        :rows="leadsRows"
        :columns="tableColumns"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
        @select="select"
    >
        <template #name-data="{ row }">
            <NuxtLink :href="`/dashboard/pipeline/leads/${row.id}`" class="text-brand hover:underline">
                {{ row.name }}
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

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>
        <template #updated_at-data="{ row }">
            {{ useDateFormat(row.updated_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No leads found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter v-model:page="page" v-model:pageCount="pageCount" :pageTotal="pageTotal" />
</template>

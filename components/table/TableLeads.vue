<script lang="ts" setup>
import { refDebounced, useDateFormat } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddLead from '~/components/modal/ModalAddLead.vue';
import type { Lead } from '~/types';

const modal = useModal();

const { columns, selectedColumns, tableColumns, selectedRows, select, search, debouncedSearch, page, pageCount, sort } =
    useTable();

const { data: leadsPaginated, status } = await useLazyFetch('/api/leads', {
    query: {
        query: debouncedSearch,
        page: page,
        limit: pageCount,
        sort: computed(() => sort.value.column),
        order: computed(() => sort.value.direction),
    },
});

async function handleDeleteLeads() {
    try {
        await Promise.all(selectedRows.value.map((lead) => $fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })));

        toast.success('Lead has been deleted successfully.');
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to delete Lead:', e);
        toast.error('Failed to delete Lead, please try again later.');
    }
}
function useTable() {
    const columns = [
        {
            key: 'contact(first_name)',
            label: 'Name',
            sortable: true,
        },
        {
            key: 'company(name)',
            label: 'Company',
            sortable: true,
        },
        {
            key: 'user(first_name)',
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
            key: 'disqualify_reason(name)',
            label: 'Disqualify Reason',
            sortable: true,
        },
        {
            key: 'rating(name)',
            label: 'Rating',
            sortable: true,
        },
        {
            key: 'source(name)',
            label: 'Lead Source',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['contact(first_name)', 'company(name)', 'score', 'status', 'rating(name)', 'created_at'];
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

    const search = ref('');
    const debouncedSearch = refDebounced(
        computed(() => search.value.trim()),
        300
    );
    const page = ref(1);
    const pageCount = ref(10);
    const sort = ref({ column: 'created_at', direction: 'desc' as const });

    // Reset page when search changes
    watch(debouncedSearch, () => {
        page.value = 1;
    });

    return {
        columns,
        selectedColumns,
        tableColumns,
        selectedRows,
        select,
        search,
        debouncedSearch,
        page,
        pageCount,
        sort,
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

            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        by="id"
        :loading="status === 'pending'"
        :rows="leadsPaginated?.result ?? []"
        :columns="tableColumns"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
            th: {
                color: 'text-weak',
                font: 'font-normal',
            },
        }"
        @select="select"
    >
        <template #contact(first_name)-data="{ row }">
            <NuxtLink :href="`/dashboard/pipeline/leads/${row.id}`" class="text-brand hover:underline">
                {{ getUserFullName(row.contact) }}
            </NuxtLink>
        </template>

        <template #company(name)-data="{ row }">
            <NuxtLink
                v-if="row.company"
                :href="`/dashboard/customer/companies/${row.company.id}`"
                class="text-brand hover:underline"
            >
                {{ row.company?.name }}
            </NuxtLink>
        </template>

        <template #user(first_name)-data="{ row }">
            {{ getUserFullName(row.user) }}
        </template>

        <template #rating(name)-data="{ row }">
            {{ row.rating?.name ?? '' }}
        </template>

        <template #disqualify_reason(name)-data="{ row }">
            {{ row.disqualify_reason?.name ?? '' }}
        </template>

        <template #source(name)-data="{ row }">
            {{ row.source?.name ?? '' }}
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
    <TableFooter v-if="leadsPaginated" v-model:page="page" v-model:pageCount="pageCount" :totalRows="leadsPaginated.total_row" />
</template>

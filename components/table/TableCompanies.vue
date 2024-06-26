<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import LazyModalDeleteCompany from '~/components/modal/ModalDeleteCompany.vue';
import LazyModalAddCompany from '~/components/modal/ModalAddCompany.vue';
import type { Company } from '~/types';
import type { Database } from '~/types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const {
    data: companies,
    status,
    refresh: refreshCompanies,
} = await useLazyFetch('/api/companies', {
    key: 'companies',
    transform: (companies) =>
        companies.map((company) => ({
            id: company.id,
            name: company.name,
            phone: company.phone,
            primaryContact: company.primaryContact,
        })),
    default: () => [],
});
const pending = computed(() => status.value === 'pending');

const supabase = useSupabaseClient<Database>();
let realtimeChannel: RealtimeChannel;
onMounted(() => {
    realtimeChannel = supabase
        .channel('public:Companies')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Companies' }, () => refreshCompanies());

    realtimeChannel.subscribe();
});
onUnmounted(() => {
    supabase.removeChannel(realtimeChannel);
});

const { columns, selectedColumns, columnsTable, selectedRows, select } = useTable();
const {
    filteredData: filteredCompanies,
    search,
    page,
    pageCount,
    sort,
    pageTotal,
    resetFilters,
} = useFilterAndPaginate(companies);
const filteredCompaniesCustom = computed(() =>
    filteredCompanies.value.map((company) => ({
        ...company,
        primaryContact: {
            value: `${company.primaryContact?.first_name ?? ''} ${company.primaryContact?.last_name ?? ''}`,
            class: 'w-[200px] max-w-[200px]',
        },
        primaryContactEmail: { value: company.primaryContact?.email ?? '', class: 'w-[220px] max-w-[220px]' },
    }))
);

const modal = useModal();

function useTable() {
    const initialColumns = [
        {
            key: 'name',
            label: 'Company Name',
            sortable: true,
        },
        {
            key: 'phone',
            label: 'Business Phone',
            sortable: true,
        },
        {
            key: 'primaryContact',
            label: 'Primary Contact',
            sortable: true,
        },
        {
            key: 'primaryContactEmail',
            label: 'Email (Primary Contact)',
            sortable: true,
        },
    ];
    const columns = [...initialColumns];

    const selectedColumns = ref(initialColumns);
    const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)));

    // Selected Rows
    const selectedRows = ref<Pick<Company, 'id'>[]>([]);
    function select(row: Pick<Company, 'id'>) {
        const index = selectedRows.value.findIndex((item) => item.id === row.id);
        if (index === -1) {
            selectedRows.value.push(row);
        } else {
            selectedRows.value.splice(index, 1);
        }
    }

    return {
        columns,
        selectedColumns,
        columnsTable,
        selectedRows,
        select,
    };
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="flex items-center justify-between gap-x-3 p-4">
        <h1 class="text-2xl font-semibold">My Active Companies</h1>

        <!-- <UPopover>
            <div class="flex items-center gap-4">
                <h1 class="text-2xl font-semibold">My Active Companies</h1>
                <UIcon name="i-heroicons-chevron-down" class="h-5 w-5" />
            </div>

            <template #panel>
                <div class="w-72 p-1">
                    <div class="group flex items-center justify-between rounded p-2 hover:bg-brand-50">
                        <button class="text-sm">All Companies</button>
                        <button class="hidden text-xs text-brand hover:underline group-hover:block">Set as Default</button>
                    <p class="flex items-center gap-2 text-xs text-brand">
                            <span>Default</span>
                            <UIcon name="i-heroicons-check" class="h-4 w-4" />
                        </p> 
                    </div>
                    <div class="group flex items-center justify-between rounded p-2 hover:bg-brand-50">
                        <button class="text-sm">Inactive Companies</button>
                        <button class="hidden text-xs text-brand hover:underline group-hover:block">Set as Default</button>
                    </div>
                    <div class="group flex items-center justify-between rounded p-2 hover:bg-brand-50">
                        <button class="text-sm">My Active Companies</button>
                        <button class="hidden text-xs text-brand hover:underline group-hover:block">Set as Default</button>
                    </div>
                </div>
            </template>
        </UPopover> -->

        <div class="hidden sm:flex sm:items-center sm:gap-1.5">
            <UButton
                v-if="!!selectedRows.length"
                icon="i-heroicons-trash"
                color="black"
                size="xs"
                variant="ghost"
                @click="
                    modal.open(LazyModalDeleteCompany, {
                        onClose: () => modal.close(),
                        companies: selectedRows,
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
                    modal.open(LazyModalAddCompany, {
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
        :rows="filteredCompaniesCustom"
        :columns="columnsTable"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
        @select="select"
    >
        <template #name-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/companies/${row.id}`" class="text-brand hover:underline">
                {{ row.name }}
            </NuxtLink>
        </template>

        <template #primaryContact-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/contacts/${row.id}`" class="text-brand hover:underline">
                {{ row.primaryContact.value }}
            </NuxtLink>
        </template>

        <template #primaryContactEmail-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/contacts/${row.id}`" class="text-brand hover:underline">
                {{ row.primaryContactEmail.value }}
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
                <p>No companies found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter v-model:page="page" v-model:pageCount="pageCount" :pageTotal="pageTotal" />
</template>

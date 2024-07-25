<script lang="ts" setup>
import { refDebounced, useDateFormat } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddCompany from '~/components/modal/ModalAddCompany.vue';
import type { Company } from '~/types';

const modal = useModal();

const filterTypes = [
    {
        type: 'all',
        label: 'All Companies',
        ['tw-group']: 'group/all',
        ['tw-button']: 'group-hover/all:opacity-100',
    },
    {
        type: 'inactive',
        label: 'Inactive Companies',
        ['tw-group']: 'group/inactive',
        ['tw-button']: 'group-hover/inactive:opacity-100',
    },
    {
        type: 'active',
        label: 'Active Companies',
        ['tw-group']: 'group/my-active',
        ['tw-button']: 'group-hover/my-active:opacity-100',
    },
] as const;
const defaultFilterType = useCookie<'all' | 'inactive' | 'active'>('companies-filter-type', {
    default: () => 'all',
});

const selectedFilterType = ref(defaultFilterType.value);
const selectedFilter = computed({
    get: () => filterTypes.find((type) => type.type === selectedFilterType.value),
    set: (value) => {
        selectedFilterType.value = value?.type ?? 'all';
    },
});

const { columns, selectedColumns, tableColumns, selectedRows, selectRow, search, debouncedSearch, page, pageCount, sort } =
    useTable();

const { data: companiesPaginated, status } = await useLazyFetch('/api/companies', {
    query: {
        query: debouncedSearch,
        page: page,
        limit: pageCount,
        sort: computed(() => sort.value.column),
        order: computed(() => sort.value.direction),
    },
    transform: (data) => ({
        ...data,
        result: data.result.map((company) => ({
            ...company,
            primaryContact: {
                value: getUserFullName(company.primaryContact),
                class: 'w-[200px] max-w-[200px]',
            },
            primaryContactEmail: { value: company.primaryContact?.email ?? '', class: 'w-[220px] max-w-[220px]' },
        })),
    }),
});

async function handleDeleteCompanies() {
    try {
        await Promise.all(selectedRows.value.map((company) => $fetch(`/api/companies/${company.id}`, { method: 'DELETE' })));

        toast.success('Company has been deleted successfully.');
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to delete company:', e);
        toast.error('Failed to delete company, please try again later.');
    }
}
function useTable() {
    const columns = [
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
            key: 'primaryContact(first_name)',
            label: 'Primary Contact',
            sortable: true,
        },
        {
            key: 'primaryContact(email)',
            label: 'Email (Primary Contact)',
            sortable: true,
        },
        {
            key: 'industry(name)',
            label: 'Industry',
            sortable: true,
        },
        {
            key: 'size(size_range)',
            label: 'Size',
            sortable: true,
        },
        {
            key: 'province(name)',
            label: 'Location',
            sortable: true,
        },
        {
            key: 'website',
            label: 'Website',
            sortable: true,
        },
        {
            key: 'linkedin',
            label: 'Linkedin',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['name', 'phone', 'primaryContact(first_name)', 'primaryContact(email)'];
    const selectedColumns = ref(columns.filter((column) => initialColumnKeys.includes(column.key)));
    const tableColumns = computed(() =>
        columns.filter((column) => selectedColumns.value.some((selected) => selected.key === column.key))
    );

    // Selected Rows
    const selectedRows = ref<Pick<Company, 'id'>[]>([]);
    function selectRow(row: Pick<Company, 'id'>) {
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
        search,
        debouncedSearch,
        page,
        pageCount,
        sort,
        selectedColumns,
        tableColumns,
        columns,
        selectedRows,
        selectRow,
    };
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="flex items-center justify-between gap-x-3 p-4">
        <UPopover v-if="selectedFilter">
            <div class="flex items-center gap-4">
                <h1 class="text-2xl font-semibold">{{ selectedFilter.label }}</h1>
                <UIcon name="i-heroicons-chevron-down" class="h-5 w-5" />
            </div>

            <template #panel>
                <ul class="w-72 p-1">
                    <li
                        v-for="filter in filterTypes"
                        :key="filter.type"
                        :class="['flex items-center justify-between rounded p-2 hover:bg-brand-50', filter['tw-group']]"
                    >
                        <button class="text-sm" @click="selectedFilter = filter">{{ filter.label }}</button>
                        <button
                            v-if="filter.type !== defaultFilterType"
                            :class="['text-xs text-brand opacity-0 hover:underline', filter['tw-button']]"
                            @click="
                                () => {
                                    defaultFilterType = filter.type;
                                    selectedFilter = filter;
                                }
                            "
                        >
                            Set as Default
                        </button>
                        <p v-else class="flex items-center gap-2 text-xs text-brand">
                            <span>Default</span>
                            <UIcon name="i-heroicons-check" class="h-4 w-4" />
                        </p>
                    </li>
                </ul>
            </template>
        </UPopover>

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
                        title: 'Company',
                        description:
                            'Deleting company will delete all records under the company as well (for example opportunities, tasks, and activities). Are you sure to delete this Company? You can’t undo this action.',
                        onConfirm: handleDeleteCompanies,
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

            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        by="id"
        :loading="status === 'pending'"
        :rows="companiesPaginated?.result ?? []"
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
        @select="selectRow"
    >
        <template #name-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/companies/${row.id}`" class="text-brand hover:underline">
                {{ row.name }}
            </NuxtLink>
        </template>

        <template #primaryContact(first_name)-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/contacts/${row.id}`" class="text-brand hover:underline">
                {{ row.primaryContact.value }}
            </NuxtLink>
        </template>

        <template #primaryContact(email)-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/contacts/${row.id}`" class="text-brand hover:underline">
                {{ row.primaryContactEmail.value }}
            </NuxtLink>
        </template>

        <template #industry(name)-data="{ row }">
            {{ row.industry.name }}
        </template>

        <template #size(size_range)-data="{ row }">
            {{ row.size.size_range }}
        </template>

        <template #province(name)-data="{ row }"> {{ row.province?.name ?? '' }}, {{ row.city?.name ?? '' }} </template>

        <template #website-data="{ row }">
            <NuxtLink :href="row.website" class="text-brand hover:underline" external target="_blank">
                {{ extractDomain(row.website) }}
            </NuxtLink>
        </template>

        <template #linkedin-data="{ row }">
            <NuxtLink :href="row.linkedin" class="text-brand hover:underline" external target="_blank">
                {{ row.linkedin }}
            </NuxtLink>
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No companies found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter
        v-if="companiesPaginated"
        v-model:page="page"
        v-model:pageCount="pageCount"
        :totalRows="companiesPaginated.total_row"
    />
</template>

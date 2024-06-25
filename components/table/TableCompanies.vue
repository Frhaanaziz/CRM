<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import LazyModalDeleteCompany from '~/components/modal/ModalDeleteCompany.vue';
import LazyModalAddCompany from '~/components/modal/ModalAddCompany.vue';
import type { Company } from '~/types';

// Columns
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

// const companies = ref([
//     {
//         id: 1,
//         name: 'Tech Innovators',
//         website: 'https://techinnovators.com',
//         linkedin: 'https://linkedin.com/company/techinnovators',
//         phone: '+1-234-567-8901',
//         industry_id: 1,
//         size_id: 2,
//         street_1: '123 Innovation Drive',
//         street_2: '',
//         street_3: '',
//         country_id: 1,
//         state_id: 1,
//         city_id: 1,
//         postal_code: '12345',
//         primary_contact: { id: 1, name: 'John Doe', email: 'johndoe@email.com' },
//         description: 'Leading tech solutions provider',
//         business_relationship: 'Partner',
//         created_at: new Date('2020-01-01'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 2,
//         name: 'Health Plus',
//         website: 'https://healthplus.com',
//         linkedin: 'https://linkedin.com/company/healthplus',
//         phone: '+1-345-678-9012',
//         industry_id: 2,
//         size_id: 3,
//         street_1: '456 Wellness Ave',
//         street_2: 'Suite 100',
//         street_3: '',
//         country_id: 1,
//         state_id: 2,
//         city_id: 2,
//         postal_code: '23456',
//         primary_contact: { id: 2, name: 'Jane Doe', email: 'janedoe@email.com' },
//         description: 'Healthcare and wellness services',
//         business_relationship: 'Client',
//         created_at: new Date('2019-05-15'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 3,
//         name: 'Green Energy Solutions',
//         website: 'https://greenenergysolutions.com',
//         linkedin: 'https://linkedin.com/company/greenenergysolutions',
//         phone: '+1-456-789-0123',
//         industry_id: 3,
//         size_id: 1,
//         street_1: '789 Solar St',
//         street_2: 'Building B',
//         street_3: '',
//         country_id: 1,
//         state_id: 3,
//         city_id: 3,
//         postal_code: '34567',
//         primary_contact: { id: 3, name: 'Alice Doe', email: 'alicedoe@email.com' },
//         description: 'Renewable energy solutions',
//         business_relationship: 'Supplier',
//         created_at: new Date('2021-07-20'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 4,
//         name: 'FinTech Future',
//         website: 'https://fintechfuture.com',
//         linkedin: 'https://linkedin.com/company/fintechfuture',
//         phone: '+1-567-890-1234',
//         industry_id: 4,
//         size_id: 2,
//         street_1: '123 Finance Road',
//         street_2: '',
//         street_3: '',
//         country_id: 1,
//         state_id: 4,
//         city_id: 4,
//         postal_code: '45678',
//         primary_contact: { id: 4, name: 'Bob Doe', email: 'bobdoe@email.com' },
//         description: 'Innovative financial technology',
//         business_relationship: 'Partner',
//         created_at: new Date('2018-03-10'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 5,
//         name: 'EduTech Academy',
//         website: 'https://edutechacademy.com',
//         linkedin: 'https://linkedin.com/company/edutechacademy',
//         phone: '+1-678-901-2345',
//         industry_id: 5,
//         size_id: 3,
//         street_1: '456 Learning Blvd',
//         street_2: 'Floor 2',
//         street_3: '',
//         country_id: 1,
//         state_id: 5,
//         city_id: 5,
//         postal_code: '56789',
//         primary_contact: { id: 5, name: 'Eve Doe', email: 'evedoe@email.com' },
//         description: 'Educational technology and services',
//         business_relationship: 'Client',
//         created_at: new Date('2020-09-05'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 6,
//         name: 'Global Logistics',
//         website: 'https://globallogistics.com',
//         linkedin: 'https://linkedin.com/company/globallogistics',
//         phone: '+1-789-012-3456',
//         industry_id: 6,
//         size_id: 2,
//         street_1: '789 Cargo Lane',
//         street_2: '',
//         street_3: '',
//         country_id: 1,
//         state_id: 6,
//         city_id: 6,
//         postal_code: '67890',
//         primary_contact: { id: 6, name: 'Alex Doe', email: 'alexdoe@email.com' },
//         description: 'Worldwide logistics and transportation',
//         business_relationship: 'Supplier',
//         created_at: new Date('2017-11-30'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 7,
//         name: 'Creative Designs',
//         website: 'https://creativedesigns.com',
//         linkedin: 'https://linkedin.com/company/creativedesigns',
//         phone: '+1-890-123-4567',
//         industry_id: 7,
//         size_id: 1,
//         street_1: '123 Art Street',
//         street_2: '',
//         street_3: '',
//         country_id: 1,
//         state_id: 7,
//         city_id: 7,
//         postal_code: '78901',
//         primary_contact: { id: 7, name: 'Max Doe', email: 'maxdoe@email.com' },
//         description: 'Design and branding agency',
//         business_relationship: 'Partner',
//         created_at: new Date('2021-01-15'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 8,
//         name: 'AutoMasters',
//         website: 'https://automasters.com',
//         linkedin: 'https://linkedin.com/company/automasters',
//         phone: '+1-901-234-5678',
//         industry_id: 8,
//         size_id: 3,
//         street_1: '456 Car Blvd',
//         street_2: 'Suite 200',
//         street_3: '',
//         country_id: 1,
//         state_id: 8,
//         city_id: 8,
//         postal_code: '89012',
//         primary_contact: { id: 8, name: 'Sam Doe', email: 'samdoe@email.com' },
//         description: 'Automotive services and solutions',
//         business_relationship: 'Client',
//         created_at: new Date('2019-02-25'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 9,
//         name: 'Foodie Haven',
//         website: 'https://foodiehaven.com',
//         linkedin: 'https://linkedin.com/company/foodiehaven',
//         phone: '+1-012-345-6789',
//         industry_id: 9,
//         size_id: 2,
//         street_1: '789 Gourmet Lane',
//         street_2: '',
//         street_3: '',
//         country_id: 1,
//         state_id: 9,
//         city_id: 9,
//         postal_code: '90123',
//         primary_contact: { id: 9, name: 'Sue Doe', email: 'suedoe@email.com' },
//         description: 'Restaurant and catering services',
//         business_relationship: 'Supplier',
//         created_at: new Date('2018-04-10'),
//         updated_at: new Date('2023-06-24'),
//     },
//     {
//         id: 10,
//         name: 'Travel Explorers',
//         website: 'https://travelexplorers.com',
//         linkedin: 'https://linkedin.com/company/travelexplorers',
//         phone: '+1-123-456-7890',
//         industry_id: 10,
//         size_id: 1,
//         street_1: '123 Adventure Road',
//         street_2: '',
//         street_3: '',
//         country_id: 1,
//         state_id: 10,
//         city_id: 10,
//         postal_code: '01234',
//         primary_contact: { id: 10, name: 'Tom Doe', email: 'tomdoe@email.com' },
//         description: 'Travel and tour services',
//         business_relationship: 'Partner',
//         created_at: new Date('2022-06-01'),
//         updated_at: new Date('2023-06-24'),
//     },
// ]);
const { data: companies, status } = useLazyFetch('/api/companies', {
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
function openDeleteCompanyModal() {
    modal.open(LazyModalDeleteCompany, {
        onClose: () => modal.close(),
        companies: selectedRows.value,
    });
}
function openAddCompanyModal() {
    modal.open(LazyModalAddCompany, {
        onClose: () => modal.close(),
    });
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="flex items-center justify-between gap-x-3 p-4">
        <UPopover>
            <!-- <UButton color="white" label="Open" trailing-icon="i-heroicons-chevron-down-20-solid" /> -->
            <div class="flex items-center gap-4">
                <h1 class="text-2xl font-semibold">My Active Companies</h1>
                <UIcon name="i-heroicons-chevron-down" class="h-5 w-5" />
            </div>

            <template #panel>
                <div class="w-72 p-1">
                    <div class="group flex items-center justify-between rounded p-2 hover:bg-brand-50">
                        <button class="text-sm">All Companies</button>
                        <button class="hidden text-xs text-brand hover:underline group-hover:block">Set as Default</button>
                        <!-- <p class="flex items-center gap-2 text-xs text-brand">
                            <span>Default</span>
                            <UIcon name="i-heroicons-check" class="h-4 w-4" />
                        </p> -->
                    </div>
                    <div class="group flex items-center justify-between rounded p-2 hover:bg-brand-50">
                        <button class="text-sm">Inactive Companies</button>
                        <button class="hidden text-xs text-brand hover:underline group-hover:block">Set as Default</button>
                        <!-- <p class="flex items-center gap-2 text-xs text-brand">
                            <span>Default</span>
                            <UIcon name="i-heroicons-check" class="h-4 w-4" />
                        </p> -->
                    </div>
                    <div class="group flex items-center justify-between rounded p-2 hover:bg-brand-50">
                        <button class="text-sm">My Active Companies</button>
                        <button class="hidden text-xs text-brand hover:underline group-hover:block">Set as Default</button>
                        <!-- <p class="flex items-center gap-2 text-xs text-brand">
                            <span>Default</span>
                            <UIcon name="i-heroicons-check" class="h-4 w-4" />
                        </p> -->
                    </div>
                </div>
            </template>
        </UPopover>

        <div class="hidden sm:flex sm:items-center sm:gap-1.5">
            <UButton
                v-if="!!selectedRows.length"
                icon="i-heroicons-trash"
                color="black"
                size="xs"
                variant="ghost"
                @click="openDeleteCompanyModal"
            >
                Delete
            </UButton>

            <UButton icon="i-heroicons-plus" color="black" size="xs" variant="ghost" @click="openAddCompanyModal"> New </UButton>

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

<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { Industry, City, Company, Province, Size } from '~/types';

interface IDataCompany extends Company {
    industry: Pick<Industry, 'name'>;
    size: Pick<Size, 'size_range'>;
    province: Pick<Province, 'name'>;
    city: Pick<City, 'name'>;
}

// Columns
const initialColumns = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
    },
    {
        key: 'industry',
        label: 'Industry',
        sortable: true,
    },
    {
        key: 'size',
        label: 'Size',
        sortable: true,
    },
    {
        key: 'location',
        label: 'Location',
        sortable: true,
    },
    {
        key: 'website',
        label: 'Website',
        sortable: true,
    },
];
const columns = [
    ...initialColumns,
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
    },
    {
        key: 'linkedin',
        label: 'LinkedIn',
        sortable: true,
    },
    {
        key: 'phone',
        label: 'Phone',
        sortable: true,
    },
    {
        key: 'street',
        label: 'Street',
        sortable: true,
    },
    {
        key: 'zip_code',
        label: 'Zip Code',
        sortable: true,
    },
];

const inputIndustries = ref<string[]>([]);
const inputSizes = ref<string[]>([]);
const selectedColumns = ref(initialColumns);
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)));

const { $api } = useNuxtApp();
const [{ data: companies, pending }, { data: industries }, { data: sizes }, { data: provinces }, { data: cities }] =
    await Promise.all([
        useLazyAsyncData(
            'companies-paginated',
            async () => {
                const companies = await $api<IDataCompany[]>('/api/companies');
                return companies.map((company) => ({
                    id: company.id,
                    name: company.name,
                    industry: company?.industry?.name ?? '',
                    size: company.size?.size_range ?? '',
                    province: company?.province?.name ?? '',
                    city: company?.city?.name ?? '',
                    website: company.website,
                    avatar: company.avatar,
                    created_at: company.created_at,
                    email: company.email,
                    linkedin: company.linkedin,
                    phone: company.phone,
                    street: company.street,
                    zip_code: company.zip_code,
                }));
            },
            {
                default: () => [],
            }
        ),
        useAPI<Industry[]>('/api/industries', {
            lazy: true,
        }),
        useAPI<Size[]>('/api/sizes', {
            lazy: true,
        }),
        useAPI<Province[]>('/api/provinces', {
            lazy: true,
        }),
        useAPI<City[]>('/api/cities', {
            lazy: true,
        }),
    ]);

const {
    filteredData: filteredCompanies,
    search,
    page,
    pageCount,
    sort,
    filters,
    pageTotal,
    pageFrom,
    pageTo,
    resetFilters,
} = useFilterAndPaginate(companies);

// Update filters
filters.value = {
    industry: [],
    size: [],
    province: [],
    city: [],
};
</script>

<template>
    <!-- Filters -->
    <div class="flex items-center justify-between gap-3 px-4 py-3"></div>

    <!-- Header and Action buttons -->
    <div class="p-3 bg-base-200 mt-3 flex justify-between items-center rounded">
        <div class="flex items-center gap-4">
            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />

            <div class="flex items-center gap-2">
                <p>Filter:</p>
                <!-- Industries Popover -->
                <UPopover mode="hover">
                    <UButton
                        variant="outline"
                        color="gray"
                        class="hover:text-brand"
                        size="xs"
                        :ui="{
                            rounded: 'rounded-xl',
                            base: 'bg-base-100',
                        }"
                        >Industry</UButton
                    >
                    <template #panel>
                        <div class="min-w-72">
                            <p class="p-3 border-b font-semibold">Filter by Industry</p>
                            <template v-if="industries">
                                <div class="p-3 bg-base-200 space-y-3 max-h-52 overflow-x-auto">
                                    <div v-for="industry in industries" :key="industry.id" class="flex items-center gap-2">
                                        <UCheckbox
                                            :id="`industry-${industry.id}`"
                                            v-model="inputIndustries"
                                            :value="industry.name"
                                        />
                                        <label :for="`industry-${industry.id}`" class="text-sm">
                                            {{ industry.name }}
                                        </label>
                                    </div>
                                </div>
                                <div class="p-3 flex justify-end gap-2 bg-base-200">
                                    <UButton
                                        variant="outline"
                                        size="sm"
                                        @click="
                                            () => {
                                                inputIndustries = [];
                                                filters.industry = [];
                                            }
                                        "
                                        >Cancel
                                    </UButton>
                                    <UButton size="sm" @click="filters.industry = inputIndustries"> Apply </UButton>
                                </div>
                            </template>
                            <template v-else>
                                <p class="p-3 flex justify-center items-center">no data</p>
                            </template>
                        </div>
                    </template>
                </UPopover>

                <!-- Size Popover -->
                <UPopover mode="hover">
                    <UButton
                        variant="outline"
                        color="gray"
                        class="hover:text-brand"
                        size="xs"
                        :ui="{
                            rounded: 'rounded-xl',
                            base: 'bg-base-100',
                        }"
                        >Size</UButton
                    >
                    <template #panel>
                        <div class="min-w-72">
                            <p class="p-3 border-b font-semibold">Filter by Company Size</p>
                            <template v-if="sizes">
                                <div class="p-3 bg-base-200 space-y-3 max-h-52 overflow-x-auto">
                                    <div v-for="size in sizes" :key="size.id" class="flex items-center gap-2">
                                        <UCheckbox :id="`size-${size.id}`" v-model="inputSizes" :value="size.size_range" />
                                        <label :for="`size-${size.id}`" class="text-sm">
                                            {{ size.size_range }}
                                        </label>
                                    </div>
                                </div>
                                <div class="p-3 flex justify-end gap-2 bg-base-200">
                                    <UButton
                                        variant="outline"
                                        size="sm"
                                        @click="
                                            () => {
                                                inputSizes = [];
                                                filters.size = [];
                                            }
                                        "
                                        >Cancel</UButton
                                    >
                                    <UButton size="sm" @click="filters.size = inputSizes">Apply</UButton>
                                </div>
                            </template>
                            <template v-else>
                                <p class="p-3 flex justify-center items-center">no data</p>
                            </template>
                        </div>
                    </template>
                </UPopover>

                <UPopover mode="hover">
                    <UButton
                        variant="outline"
                        color="gray"
                        class="hover:text-brand"
                        size="xs"
                        :ui="{
                            rounded: 'rounded-xl',
                            base: 'bg-base-100',
                        }"
                        >Location</UButton
                    >
                    <template #panel>
                        <div class="min-w-72">
                            <p class="p-3 border-b font-semibold">Filter by Location</p>
                            <div class="p-3 bg-base-200 space-y-3 max-h-52 overflow-x-auto">
                                <UFormGroup label="Province" name="province">
                                    <!-- <UInputMenu v-model="selectedProvinces" :options="provinces?.map(({ name }) => name ?? [])" /> -->
                                    <UInputMenu :options="provinces?.map(({ name }) => name ?? [])" />
                                </UFormGroup>

                                <UFormGroup label="City" name="city">
                                    <!-- <UInputMenu v-model="selectedCities" :options="cities?.map(({ name }) => name ?? [])" /> -->
                                    <UInputMenu :options="cities?.map(({ name }) => name ?? [])" />
                                </UFormGroup>
                            </div>
                            <div class="p-3 flex justify-end gap-2 bg-base-200">
                                <UButton variant="outline" size="sm">Cancel</UButton>
                                <UButton size="sm">Apply</UButton>
                            </div>
                        </div>
                    </template>
                </UPopover>
            </div>
        </div>

        <div class="flex gap-1.5 items-center">
            <!-- Columns Selector -->
            <USelectMenu v-model="selectedColumns" :options="columns" multiple :uiMenu="{ width: 'min-w-32' }">
                <UButton icon="i-heroicons-view-columns" color="gray" size="xs"> Columns </UButton>
            </USelectMenu>

            <!-- Reset Filters Button -->
            <UButton
                icon="i-heroicons-funnel"
                color="gray"
                size="xs"
                :disabled="
                    !(
                        !!search.length ||
                        !!filters.industry?.length ||
                        !!filters.size?.length ||
                        !!filters.province?.length ||
                        !!filters.city?.length
                    )
                "
                @click="resetFilters"
            >
                Reset
            </UButton>
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model:sort="sort"
        :rows="filteredCompanies"
        :columns="columnsTable"
        :loading="pending"
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
        sort-mode="manual"
        class="w-full"
        :ui="{
            td: { base: 'max-w-[0] truncate' },
            default: { checkbox: { color: 'gray' } },
        }"
    >
        <template #name-data="{ row }">
            <div class="flex items-center gap-2">
                <UAvatar :src="row?.avatar ?? '/images/avatar-fallback.jpg'" size="xs" />
                <NuxtLink :href="`/dashboard/companies/${row.id}`" class="text-brand hover:underline">
                    {{ row.name }}
                </NuxtLink>
            </div>
        </template>

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

        <template #location-data="{ row }">
            {{ `${row.city}, ${row.province}` }}
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center py-10 gap-y-5">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No companies found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->

    <div class="flex flex-wrap justify-between items-center mt-5">
        <div>
            <span class="text-sm leading-5">
                Showing
                <span class="font-medium">{{ pageFrom }}</span>
                to
                <span class="font-medium">{{ pageTo }}</span>
                of
                <span class="font-medium">{{ pageTotal }}</span>
                results
            </span>
        </div>

        <div class="flex items-center gap-1.5">
            <span class="text-sm leading-5">Rows per page:</span>

            <USelect v-model="pageCount" :options="[3, 5, 10, 20, 30, 40]" class="me-2 w-20" size="xs" />
        </div>

        <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="pageTotal"
            :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: '!rounded-full min-w-[32px] justify-center',
                default: {
                    activeButton: {
                        variant: 'outline',
                    },
                },
            }"
        />
    </div>
</template>

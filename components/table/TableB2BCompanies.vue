<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';

// const [{ data: companies, status }, { data: industries }, { data: sizes }, { data: provinces }, { data: cities }] =
const [{ data: companies, status }, { data: industries }, { data: sizes }] = await Promise.all([
    await useLazyFetch('/api/b2b-companies', {
        transform: (companies) =>
            companies.map((company) => ({
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
                zip_code: company.zip_code,
            })),
        default: () => [],
    }),
    useLazyFetch('/api/industries'),
    useLazyFetch('/api/sizes'),
    // useLazyFetch('/api/provinces'),
    // useLazyFetch('/api/cities'),
]);
const pending = computed(() => status.value === 'pending');

const {
    columns,
    selectedColumns,
    tableColumns,
    companiesRows,
    search,
    page,
    pageCount,
    sort,
    pageTotal,
    resetFilters,
    inputIndustries,
    inputSizes,
    filters,
} = useTable();

function useTable() {
    const columns = [
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
            key: 'zip_code',
            label: 'Zip Code',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['name', 'industry', 'size', 'location', 'website'];
    const selectedColumns = ref(columns.filter((column) => initialColumnKeys.includes(column.key)));
    const tableColumns = computed(() =>
        columns.filter((column) => selectedColumns.value.some((selected) => selected.key === column.key))
    );

    const inputIndustries = ref<string[]>([]);
    const inputSizes = ref<string[]>([]);

    const {
        filteredData: filteredCompanies,
        search,
        page,
        pageCount,
        sort,
        filters,
        pageTotal,
        resetFilters,
    } = useFilterAndPaginate(companies);

    // Update filters
    filters.value = {
        industry: [],
        size: [],
        province: [],
        city: [],
    };

    return {
        columns,
        selectedColumns,
        tableColumns,
        companiesRows: filteredCompanies,
        search,
        page,
        pageCount,
        sort,
        pageTotal,
        resetFilters,
        inputIndustries,
        inputSizes,
        filters,
    };
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="mt-3 flex items-center justify-between gap-x-3 rounded bg-base-200 p-3">
        <div class="flex items-center gap-4">
            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />

            <div class="hidden sm:flex sm:items-center sm:gap-2">
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
                            <p class="border-b p-3 font-semibold">Filter by Industry</p>
                            <template v-if="industries">
                                <div class="max-h-52 space-y-3 overflow-x-auto bg-base-200 p-3">
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
                                <div class="flex justify-end gap-2 bg-base-200 p-3">
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
                                <p class="flex items-center justify-center p-3">no data</p>
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
                            <p class="border-b p-3 font-semibold">Filter by Company Size</p>
                            <template v-if="sizes">
                                <div class="max-h-52 space-y-3 overflow-x-auto bg-base-200 p-3">
                                    <div v-for="size in sizes" :key="size.id" class="flex items-center gap-2">
                                        <UCheckbox :id="`size-${size.id}`" v-model="inputSizes" :value="size.size_range" />
                                        <label :for="`size-${size.id}`" class="text-sm">
                                            {{ size.size_range }}
                                        </label>
                                    </div>
                                </div>
                                <div class="flex justify-end gap-2 bg-base-200 p-3">
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
                                <p class="flex items-center justify-center p-3">no data</p>
                            </template>
                        </div>
                    </template>
                </UPopover>

                <!-- Location Popover -->
                <!-- <UPopover mode="hover">
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
                            <p class="border-b p-3 font-semibold">Filter by Location</p>
                            <div class="max-h-52 space-y-3 overflow-x-auto bg-base-200 p-3">
                                <UFormGroup label="Province" name="province">
                                    <UInputMenu v-model="selectedProvinces" :options="provinces?.map(({ name }) => name ?? [])" />
                                </UFormGroup>

                                <UFormGroup label="City" name="city">
                                    <UInputMenu v-model="selectedCities" :options="cities?.map(({ name }) => name ?? [])" />
                                </UFormGroup>
                            </div>
                            <div class="flex justify-end gap-2 bg-base-200 p-3">
                                <UButton variant="outline" size="sm">Cancel</UButton>
                                <UButton size="sm">Apply</UButton>
                            </div>
                        </div>
                    </template>
                </UPopover> -->
            </div>
        </div>

        <div class="hidden sm:flex sm:items-center sm:gap-1.5">
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
        :rows="companiesRows"
        :columns="tableColumns"
        :loading="pending"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
    >
        <template #name-data="{ row }">
            <div class="flex items-center gap-2">
                <UAvatar :src="row?.avatar ?? getFallbackAvatarUrl(row?.name)" size="xs" />
                <NuxtLink :href="`/dashboard/resources/b2b-database/${row.id}`" class="text-brand hover:underline">
                    {{ row.name }}
                </NuxtLink>
            </div>
        </template>

        <template #website-data="{ row }">
            <NuxtLink :href="row.website" class="text-brand hover:underline" external target="_blank">
                {{ extractDomain(row.website ?? '') }}
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
            {{ `${row.province}, ${row.city}` }}
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No B2B companies found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter v-model:page="page" v-model:pageCount="pageCount" :pageTotal="pageTotal" />
</template>

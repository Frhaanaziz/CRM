<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';

const { data } = await useLazyAsyncData(
    () => {
        const headers = useRequestHeaders(['cookie']);
        return Promise.all([$fetch('/api/industries', { headers }), $fetch('/api/sizes', { headers })]);
    },
    {
        transform: ([industries, sizes]) => [industries, sizes] as const,
        default: () => [[], []],
    }
);
const industries = computed(() => data.value[0]);
const sizes = computed(() => data.value[1]);

const { columns, selectedColumns, tableColumns, search, debouncedSearch, page, pageSize, sort } = useDataTable({
    columns: [
        {
            key: 'name',
            label: 'Name',
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
    ],
    initialColumnKeys: ['name', 'industry(name)', 'size(size_range)', 'province(name)', 'website'],
});

const inputIndustries = ref<string[]>([]);
const inputSizes = ref<string[]>([]);

const resetFilters = () => {
    search.value = '';
    inputIndustries.value = [];
    inputSizes.value = [];
    page.value = 1;
};

const { data: companiesPaginated, status } = await useLazyFetch(`/api/b2b-companies`, {
    query: {
        query: debouncedSearch,
        page: page,
        limit: pageSize,
        sort: computed(() => sort.value.column),
        order: computed(() => sort.value.direction),
        industry_id: computed(() => inputIndustries.value),
        size_id: computed(() => inputSizes.value),
    },
    headers: useRequestHeaders(['cookie']),
});
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
                            <div v-if="industries" class="max-h-52 space-y-3 overflow-x-auto bg-base-200 p-3">
                                <div v-for="industry in industries" :key="industry.id" class="flex items-center gap-2">
                                    <UCheckbox :id="`industry-${industry.id}`" v-model="inputIndustries" :value="industry.id" />
                                    <label :for="`industry-${industry.id}`" class="text-sm">
                                        {{ industry.name }}
                                    </label>
                                </div>
                            </div>
                            <p v-else class="flex items-center justify-center p-3">no data</p>
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
                            <div v-if="sizes" class="max-h-52 space-y-3 overflow-x-auto bg-base-200 p-3">
                                <div v-for="size in sizes" :key="size.id" class="flex items-center gap-2">
                                    <UCheckbox :id="`size-${size.id}`" v-model="inputSizes" :value="size.id" />
                                    <label :for="`size-${size.id}`" class="text-sm">
                                        {{ size.size_range }}
                                    </label>
                                </div>
                            </div>
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
                :disabled="!(!!search.length || !!inputIndustries?.length || !!inputSizes?.length)"
                @click="resetFilters"
            >
                Reset
            </UButton>
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model:sort="sort"
        :rows="companiesPaginated?.result ?? []"
        :columns="tableColumns"
        :loading="status === 'pending'"
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
    >
        <template #name-data="{ row }">
            <div class="flex items-center gap-2">
                <UAvatar :src="row?.avatar ?? getFallbackAvatarUrl(row?.name)" size="xs" />
                <NuxtLink :href="`/dashboard/resources/b2b-database/${row.id}`" class="text-brand hover:underline">
                    {{ row.name }}
                </NuxtLink>
            </div>
        </template>

        <template #industry(name)-data="{ row }">
            {{ row.industry?.name }}
        </template>

        <template #size(size_range)-data="{ row }">
            {{ row.size?.size_range }}
        </template>

        <template #province(name)-data="{ row }">
            <template v-if="row.province || row.city">
                {{ `${row.province?.name ?? ''}, ${row.city?.name ?? ''}` }}
            </template>
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
            {{ useDateFormat(row.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No B2B companies found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter
        v-if="companiesPaginated"
        v-model:page="page"
        v-model:pageSize="pageSize"
        :totalRows="companiesPaginated.total_row"
    />
</template>

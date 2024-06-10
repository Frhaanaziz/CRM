<script setup lang="ts">
import { useDebounce } from '@vueuse/core';

// Unable to use custom useAPI due to potential type error in the transform function
const { data: companies, pending } = await useLazyFetch(
    '/api/companies',
    {
        key: 'companies',
        $fetch: useNuxtApp().$api,
        transform: (v) =>
            v.map((company) => ({
                id: company.id,
                name: company.name,
                industry: company?.industry?.name ?? '',
                size: company.size?.size_range ?? '',
                location: `${company?.city?.name}, ${company?.province?.name}`,
                website: company.website,
                avatar: company.avatar,
            })),
    }
);

const search = ref('');
const debounceSearch = useDebounce(search, 300);
const page = ref(1);
const LIMIT = 10;
const filteredRows = computed(() => {
    if (!debounceSearch.value)
        return companies.value?.slice(
            (page.value - 1) * LIMIT,
            page.value * LIMIT
        );

    // search
    const searchedCompanies = companies.value?.filter((company) =>
        company.name
            .toLowerCase()
            .includes(debounceSearch.value.toLowerCase().trim())
    );

    // pagination
    return searchedCompanies?.slice(
        (page.value - 1) * LIMIT,
        page.value * LIMIT
    );
});

const columns = [
    {
        label: 'Name',
        key: 'name',
    },
    {
        label: 'Industry',
        key: 'industry',
    },
    {
        label: 'Size',
        key: 'size',
    },
    {
        label: 'Location',
        key: 'location',
    },
    {
        label: 'Website',
        key: 'website',
    },
];
</script>

<template>
    <div class="p-3 bg-base-200 mt-3 flex justify-between items-center rounded">
        <div class="flex items-center gap-2">
            <p>Filter:</p>
            <UPopover mode="hover">
                <UButton
                    variant="outline"
                    color="gray"
                    label="Open"
                    class="focus:text-brand"
                    >Industry</UButton
                >

                <!-- <template #panel>
                    <div class="p-4">
                        <Placeholder class="h-20 w-48" />
                    </div>
                </template> -->
            </UPopover>
            <UButton variant="outline" color="gray" class="focus:text-brand"
                >Size</UButton
            >
            <UButton variant="outline" color="gray" class="focus:text-brand"
                >Location</UButton
            >
        </div>

        <UInput
            v-model="search"
            placeholder="Search"
            class="ml-2"
            icon="i-heroicons-magnifying-glass"
        />
    </div>

    <UTable
        :rows="filteredRows ?? []"
        :columns="columns"
        class="mt-5"
        :loading="pending"
        :loading-state="{
            icon: 'i-heroicons-arrow-path-20-solid',
            label: 'Loading...',
        }"
        :progress="{ color: 'primary', animation: 'carousel' }"
    >
        <template #name-data="{ row }">
            <div class="flex items-center gap-2">
                <UAvatar
                    :src="row?.avatar ?? '/images/avatar-fallback.jpg'"
                    size="xs"
                />
                <NuxtLink
                    :href="`/dashboard/companies/${row.id}`"
                    class="text-brand hover:underline"
                >
                    {{ row.name }}
                </NuxtLink>
            </div>
        </template>

        <template #website-data="{ row }">
            <NuxtLink
                :href="row.website"
                class="text-brand hover:underline"
                external
                target="_blank"
            >
                {{ extractDomain(row.website) }}
            </NuxtLink>
        </template>

        <template #empty-state>
            <div
                class="flex flex-col items-center justify-center py-10 gap-y-5"
            >
                <NuxtImg
                    src="/icons/magnifying-glass-x.svg"
                    alt=""
                    width="64"
                    height="64"
                />
                <p>No companies found</p>
            </div>
        </template>
    </UTable>

    <div v-if="filteredRows?.length" class="flex justify-end mt-4">
        <UPagination
            v-model="page"
            :page-count="LIMIT"
            :total="companies?.length ?? 0"
        />
    </div>
</template>

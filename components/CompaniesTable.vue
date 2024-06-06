<script setup lang="ts">
const { data: companies, pending } = await useLazyFetch('/api/companies', {
    key: 'companies',
    transform: (v) =>
        v.map((company) => ({
            id: company.id,
            name: company.name,
            industry: company?.industry?.name ?? '',
            size: company.size?.size_range ?? '',
            location: `${company?.city?.name}, ${company?.province?.name}`,
            website: company.website,
        })),
});

const search = ref('');
const page = ref(1);
const LIMIT = 10;
const filteredRows = computed(() => {
    if (!search.value)
        return companies.value?.slice(
            (page.value - 1) * LIMIT,
            page.value * LIMIT
        );

    // search
    const searchedCompanies = companies.value?.filter((company) =>
        company.name.toLowerCase().includes(search.value.toLowerCase())
    );

    // pagination
    return searchedCompanies?.slice(
        (page.value - 1) * LIMIT,
        page.value * LIMIT
    );
});
</script>

<template>
    <div class="p-3 bg-base-200 mt-3 flex justify-between items-center rounded">
        <div class="flex items-center gap-2">
            <p>Filter:</p>
            <UButton variant="outline">Industry</UButton>
            <UButton variant="outline" color="gray">Size</UButton>
            <UButton variant="outline" color="gray">Location</UButton>
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
        class="mt-5"
        :loading="pending"
        :loading-state="{
            icon: 'i-heroicons-arrow-path-20-solid',
            label: 'Loading...',
        }"
        :progress="{ color: 'primary', animation: 'carousel' }"
    >
        <template #name-data="{ row }">
            <NuxtLink
                :href="`/dashboard/companies/${row.id}`"
                class="text-brand hover:underline"
            >
                {{ row.name }}
            </NuxtLink>
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
    </UTable>

    <div v-if="companies" class="flex justify-end mt-4">
        <UPagination
            v-model="page"
            :page-count="LIMIT"
            :total="companies.length"
        />
    </div>
</template>

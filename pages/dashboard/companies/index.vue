<script setup lang="ts">
import type { Company } from '~/types';

type CompanyType = Pick<
    Company,
    'id' | 'name' | 'phone' | 'email' | 'created_at'
>;
const { data: companies, pending } = await useLazyFetch<CompanyType[]>(
    '/api/companies',
    {
        key: 'companies',
        // to reduce the size of the response, we can transform the response data. to reduce the payload size
        transform: (v) =>
            v.map((company) => ({
                id: company.id,
                name: company.name,
                phone: company.phone,
                email: company.email,
                created_at: company.created_at,
            })),
    }
);

const { data: dataSummary } = await useAsyncData(async () => {
    const model = ['companies', 'industries', 'locations'];
    const data = await Promise.all(
        model.map((model) => $fetch(`/api/${model}/count`))
    );
    return data.map((value, i) => ({ title: model[i], value }));
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
    const searchedCompanies = companies.value?.filter((company) => {
        return company.name.toLowerCase().includes(search.value.toLowerCase());
        // return Object.values(company).some((value) => {
        //   return String(value).toLowerCase().includes(search.value.toLowerCase())
        // })
    });

    // pagination
    return searchedCompanies?.slice(
        (page.value - 1) * LIMIT,
        page.value * LIMIT
    );
});
</script>

<template>
    <div class="px-4 sm:px-6 py-8">
        <h1 class="text-2xl font-semibold">B2B Company Database</h1>
        <!-- <pre class="text-2xl font-semibold">
            {{ $auth.user }}
        </pre>
        <pre class="text-2xl font-semibold mt-20">{{ $config }} </pre> -->
        <div class="mt-10 grid grid-cols-3 gap-5">
            <div
                v-for="data in dataSummary"
                :key="data.title"
                class="p-3 border border-default rounded-md"
            >
                <p class="text-4xl text-brand font-semibold">
                    {{ data.value }}
                </p>
                <p class="capitalize">{{ data.title }}</p>
            </div>
        </div>

        <div
            class="p-3 bg-base-200 mt-3 flex justify-between items-center rounded"
        >
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

        <!-- <CompaniesTable /> -->

        <UTable
            :rows="filteredRows ?? []"
            class="mt-5"
            :loading="pending"
            :loading-state="{
                icon: 'i-heroicons-arrow-path-20-solid',
                label: 'Loading...',
            }"
            :progress="{ color: 'primary', animation: 'carousel' }"
        />

        <div v-if="companies" class="flex justify-end mt-4">
            <UPagination
                v-model="page"
                :page-count="LIMIT"
                :total="companies.length"
            />
        </div>
    </div>
</template>

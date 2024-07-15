<script setup lang="ts">
const { data: dataSummary } = await useAsyncData(async () => {
    const model = ['b2b-companies', 'industries', 'cities'];
    const data = await Promise.all(model.map((model) => $fetch(`/api/${model}/count`)));
    return data.map((value, i) => ({ title: !i ? 'Companies' : model[i], value }));
});
</script>

<template>
    <div class="px-4 py-8 sm:px-6">
        <h1 class="text-2xl font-semibold">B2B Company Database</h1>
        <div class="mt-5 grid gap-5 sm:mt-10 sm:grid-cols-3">
            <div v-for="data in dataSummary" :key="data.title" class="border-default rounded-md border p-3">
                <p class="text-4xl font-semibold text-brand">
                    {{ data.value }}
                </p>
                <p class="capitalize">{{ data.title }}</p>
            </div>
        </div>

        <TableB2BCompanies />
    </div>
</template>

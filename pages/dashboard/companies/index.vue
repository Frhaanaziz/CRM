<script setup lang="ts">
const { $api } = useNuxtApp();

const { data: dataSummary } = await useAsyncData(async () => {
    const model = ['companies', 'industries', 'locations'];
    const data = await Promise.all(
        model.map((model) => $api(`/api/${model}/count`))
    );
    return data.map((value, i) => ({ title: model[i], value }));
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

        <CompaniesTable />
    </div>
</template>

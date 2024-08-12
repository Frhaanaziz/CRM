<script lang="ts" setup>
import { Doughnut } from 'vue-chartjs';

const props = defineProps<{
    range: {
        start_date: string;
        end_date: string;
    };
}>();

const { data } = await useLazyFetch('/api/reports', {
    key: 'reports',
    // query: computed(() => props.range),
    query: props.range,
    headers: useRequestHeaders(['cookie']),
});
const opportunitiesData = computed(() => data.value?.opportunity_data);
const leadsData = computed(() => data.value?.lead_data);

const stats = ref([
    {
        title: 'Opportunities',
        value: 69,
    },
    {
        title: 'Win Rate',
        value: '80%',
    },
    {
        title: 'Avg Time to Win',
        value: '70 Days',
    },
    {
        title: 'Avg Value per Win',
        value: 'Rp. 200.000.000',
    },
    {
        title: 'Avg Value per Win',
        value: 'Rp. 200.000.000',
    },
    {
        title: 'Avg Value per Win',
        value: 'Rp. 200.000.000',
    },
]);

const doughnutCharts = computed(() => [
    {
        title: 'Leads By Rating',
        data: generateChartData(leadsData.value?.leads_rating ?? {}),
    },
    {
        title: 'Deals Lost Reason',
        data: generateChartData(opportunitiesData.value?.opportunity_lost_reason ?? {}),
    },
    {
        title: 'Leads By Industry',
        data: generateChartData(leadsData.value?.leads_industry ?? {}),
    },
    {
        title: 'Leads By Size',
        data: generateChartData(leadsData.value?.leads_size ?? {}),
    },
]);
function generateChartData(data: Record<string, number>) {
    const limit = 5;

    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const labels = sortedData.slice(0, limit).map(([key]) => key);
    const datasetData = sortedData.slice(0, limit).map(([_, value]) => value);

    // Calculate the total sum of datasetData
    const totalSum = datasetData.reduce((sum, value) => sum + value, 0);

    // Calculate the percentage for each value and round it to 2 decimal places
    const percentages = datasetData.map((value) => Math.round((value / totalSum) * 10000) / 100);

    // Calculate the remaining percentage for "Others"
    const othersPercentage = 100 - percentages.reduce((sum, value) => sum + value, 0);

    return {
        labels: [...labels, 'Others'],
        datasets: [
            {
                backgroundColor: ['#3892F3', '#7E84FC', '#15A46E', '#E46F00', '#F75C46', '#AAADB1'],
                data: [...percentages, othersPercentage],
            },
        ],
    };
}
</script>

<template>
    <section class="grid grid-cols-12 gap-4 bg-base-200 p-4">
        <div class="col-span-8 flex flex-col gap-5">
            <ul class="grid grid-cols-3 gap-5">
                <li v-for="stat in stats" :key="stat.title" class="space-y-2 rounded-lg bg-base-100 p-4 shadow">
                    <p class="text-center text-xl font-medium">{{ stat.value }}</p>
                    <p class="text-center text-gray-500">{{ stat.title }}</p>
                </li>
            </ul>

            <ul class="grid grid-cols-2 gap-5">
                <template v-for="chart in doughnutCharts" :key="chart.title">
                    <li v-if="chart.data.labels.length > 1" class="rounded bg-base-100 p-4 shadow">
                        <h2 class="mb-4 text-xl font-semibold">{{ chart.title }}</h2>
                        <div class="grid grid-cols-5 gap-4">
                            <div class="col-span-2">
                                <Doughnut
                                    :data="chart.data"
                                    :options="{
                                        responsive: true,
                                        cutout: '75%',
                                    }"
                                />
                            </div>

                            <ul class="col-span-3 space-y-2">
                                <li v-for="(label, i) in chart.data.labels" :key="label" class="flex items-center gap-2">
                                    <div
                                        :style="`background-color: ${chart.data.datasets[0].backgroundColor[i]};`"
                                        class="h-3 w-3 shrink-0 rounded"
                                    ></div>
                                    <p class="text-xs">{{ label }}</p>
                                </li>
                            </ul>
                        </div>
                    </li>
                </template>
            </ul>
        </div>

        <div class="col-span-4 space-y-2 rounded-lg bg-base-100 p-4 shadow">
            <h2 class="text-xl font-semibold">Leaderboard</h2>
            <UTable
                :rows="// opportunitiesData?.opportunity_leaderboard.map(({ name, total }) => ({
                //     user: name,
                //     revenue: total,
                // })) ?? []
                [
                    { user: 'Tiana Calzoni', revenue: 'Rp80jt' },
                    { user: 'Livia Septimus', revenue: 'Rp70jt' },
                    { user: 'Zain Carder', revenue: 'Rp60' },
                    { user: 'Angel Westervelt', revenue: 'Rp50jt' },
                    { user: 'Brandon Mango', revenue: 'Rp40jt' },
                    { user: 'Alena Rosser', revenue: 'Rp30jt' },
                    { user: 'Alfonso Torff', revenue: 'Rp20jt' },
                    { user: 'Alden Kinnear', revenue: 'Rp10jt' },
                    { user: 'Erin Gouse', revenue: 'Rp5jt' },
                    { user: 'Kianna Calzoni', revenue: 'Rp1jt' },
                ]"
            />
        </div>
    </section>
</template>

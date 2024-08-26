<script lang="ts" setup>
import type { ChartData } from 'chart.js';
import { Bar } from 'vue-chartjs';

const props = defineProps<{
    start_date: string;
    end_date: string;
}>();

const { data: reports } = await useLazyFetch('/api/reports/sales-funnel', {
    query: props,
});
const opportunityStatuses = computed(() =>
    Object.keys(reports.value?.opportunity_status ?? {}).map((key) => ({ name: key, ...reports.value?.opportunity_status[key] }))
);
watchEffect(() => console.log('reports', reports.value?.opportunity_status));

const stats = computed(() => [
    {
        title: 'Opportunities',
        value: reports.value?.total_opportunity,
    },
    {
        title: 'Win Rate',
        value: `${reports.value?.win_rate?.toFixed(2) ?? 0}%`,
    },
    {
        title: 'Avg. Time to Win',
        value: `${reports.value?.avg_deal_time ?? 0} Days`,
    },
    {
        title: 'Avg. Value per Win',
        value: formatToRupiah(reports.value?.avg_deal_size ?? 0),
    },
]);

function formatOpportunityStatusToBarData() {
    const data = reports.value?.opportunity_status ?? {};
    const labels = Object.keys(data);
    return {
        labels,
        datasets: [
            {
                data: labels.map((label) => data[label].count),
                backgroundColor: labels.map((label) => {
                    if (label === 'won') return 'rgba(0, 161, 85, 1)';
                    return 'rgba(37, 99, 235, 1)';
                }),
                borderWidth: 0,
                borderRadius: 10,
                borderSkipped: false,

                barPercentage: 1,
                categoryPercentage: 0.9,
            },
        ],
    } satisfies ChartData<'bar'>;
}
</script>

<template>
    <section class="space-y-10 p-4">
        <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="stat in stats" :key="stat.title" class="space-y-2 rounded-lg border p-4 shadow">
                <p class="text-center text-xl font-medium">{{ stat.value }}</p>
                <p class="text-center text-gray-500">{{ stat.title }}</p>
            </li>
        </ul>

        <div class="grid grid-cols-12">
            <ul class="col-span-2 grid grid-cols-1 gap-4 py-2">
                <li v-for="status in opportunityStatuses" :key="status.name" class="space-y-1 px-2">
                    <p
                        class="truncate rounded px-2 py-1 text-center font-semibold capitalize text-white"
                        :class="[status.name === 'won' ? 'bg-green-800' : 'bg-blue-800']"
                    >
                        {{ status.name }}
                    </p>
                    <p class="px-2 py-1 text-center font-semibold text-gray-500">{{ status.count }}</p>
                </li>
            </ul>
            <div class="col-span-10 h-[345px]">
                <Bar
                    :data="formatOpportunityStatusToBarData()"
                    :options="{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                            x: {
                                display: false,
                            },
                            y: {
                                display: false,
                            },
                        },
                    }"
                />
            </div>
        </div>

        <UTable
            :rows="
                Object.keys(reports?.opportunity_status ?? []).map((stage) => ({
                    stage,
                    count: reports?.opportunity_status[stage].count,
                    value: formatToRupiah(reports?.opportunity_status[stage].est_value ?? 0),
                    'weighted value': formatToRupiah(reports?.opportunity_status[stage].act_value ?? 0),
                }))
            "
        />
    </section>
</template>

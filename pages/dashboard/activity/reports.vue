<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs';
import type { HorizontalNavigationLink } from '#ui/types';
import type { ChartData } from 'chart.js';

const selectedRange = ref(5);
const rangeOptions = [
    {
        id: 1,
        label: 'Today',
        type: 'daily',
        value: {
            start_date: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
            end_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        },
    },
    {
        id: 2,
        label: 'Yesterday',
        type: 'daily',
        value: {
            start_date: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)).toISOString(),
            end_date: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(23, 59, 59, 999)).toISOString(),
        },
    },
    {
        id: 3,
        label: 'This Week',
        type: 'weekly',
        value: {
            start_date: new Date(
                new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).setHours(0, 0, 0, 0)
            ).toISOString(),
            end_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        },
    },
    {
        id: 4,
        label: 'Last Week',
        type: 'weekly',
        value: {
            start_date: new Date(
                new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 7)).setHours(0, 0, 0, 0)
            ).toISOString(),
            end_date: new Date(
                new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 1)).setHours(23, 59, 59, 999)
            ).toISOString(),
        },
    },
    {
        id: 5,
        label: 'This Month',
        type: 'monthly',
        value: {
            start_date: new Date(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)).toISOString(),
            end_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        },
    },
    {
        id: 6,
        label: 'Last Month',
        type: 'monthly',
        value: {
            start_date: new Date(
                new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(1)).setHours(0, 0, 0, 0)
            ).toISOString(),
            end_date: new Date(new Date(new Date().setDate(0)).setHours(23, 59, 59, 999)).toISOString(),
        },
    },
    {
        id: 7,
        label: 'This Year',
        type: 'yearly',
        value: {
            start_date: new Date(new Date(new Date().getFullYear(), 0, 1).setHours(0, 0, 0, 0)).toISOString(),
            end_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        },
    },
    {
        id: 8,
        label: 'Last Year',
        type: 'yearly',
        value: {
            start_date: new Date(new Date(new Date().getFullYear() - 1, 0, 1).setHours(0, 0, 0, 0)).toISOString(),
            end_date: new Date(new Date(new Date().getFullYear(), 0, 0).setHours(23, 59, 59, 999)).toISOString(),
        },
    },
];
const selectedRangeOption = computed(() => rangeOptions.find((option) => option.id === selectedRange.value));

const reportType = ref<'sales' | 'activity' | 'performance'>('sales');
const reportTypeOptions = computed<HorizontalNavigationLink[]>(() => [
    {
        label: 'Sales Funnel',
        active: reportType.value === 'sales',
        click: () => (reportType.value = 'sales'),
    },
    {
        label: 'Activity Overview',
        active: reportType.value === 'activity',
        click: () => (reportType.value = 'activity'),
    },
    {
        label: 'Performance Comparison',
        active: reportType.value === 'performance',
        click: () => (reportType.value = 'performance'),
    },
]);

const userType = ref('All User');
const userTypeOptions = ['All User', 'Admin', 'User'];

const { data: reports } = await useFetch('/api/reports', {
    method: 'GET',
    query: computed(() => selectedRangeOption.value?.value),
});

const salesFunnelStat = ref([
    {
        title: 'Opportunities',
        value: reports.value?.total_opportunity,
    },
    {
        title: 'Win Rate',
        value: '-1%',
    },
    {
        title: 'Avg. Time to Win',
        value: reports.value?.avg_deal_age ?? 0 + ' Days',
    },
    {
        title: 'Avg. Value per Win',
        value: formatToRupiah(reports.value?.avg_deal_age ?? 0),
    },
]);

const activityStat = ref([
    {
        title: 'Opportunities',
        value: reports.value?.total_opportunity,
    },
    {
        title: 'Win Rate',
        value: '-1%',
    },
    {
        title: 'Avg Time to Win',
        value: reports.value?.avg_deal_age ?? 0 + ' Days',
    },
    {
        title: 'Avg Value per Win',
        value: formatToRupiah(reports.value?.avg_deal_age ?? 0),
    },
    {
        title: 'Avg Value per Win',
        value: formatToRupiah(reports.value?.avg_deal_age ?? 0),
    },
    {
        title: 'Avg Value per Lost',
        value: 'Rp. -1',
    },
]);

const doughnutCharts = computed(
    () =>
        [
            // {
            // title: 'Leads By Rating',
            // data: generateDoughnutChartData(reports.value?.leads_industry ?? {}),
            // },
            // {
            //     title: 'Deals Lost Reason',
            //     data: generateDoughnutChartData(reports.value?.opportunity_lost_reason ?? {}),
            // },
            {
                title: 'Leads By Industry',
                data: generateDoughnutChartData(reports.value?.leads_industry ?? {}),
            },
            {
                title: 'Leads By Size',
                data: generateDoughnutChartData(reports.value?.leads_size ?? {}),
            },
        ] as { title: string; data: ChartData<'doughnut'> }[]
);
function generateDoughnutChartData(data: Record<string, number>) {
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
    <div v-if="selectedRangeOption">
        <header class="border-b px-4 py-5">
            <h1 class="font-semibold">Reports</h1>
        </header>

        <UHorizontalNavigation :links="reportTypeOptions" />

        <section class="flex items-center gap-4 border-b px-4 py-2">
            <USelectMenu v-model="selectedRange" :options="rangeOptions" value-attribute="id">
                <template #leading>
                    <UIcon name="i-heroicons-calendar-days" class="h-5 w-5" />
                </template>
            </USelectMenu>
            <USelectMenu v-model="userType" :options="userTypeOptions" disabled>
                <template #leading>
                    <UIcon name="i-heroicons-user" class="h-5 w-5" />
                </template>
            </USelectMenu>
        </section>

        <section v-if="reportType === 'sales'" class="space-y-10 p-4">
            <ul class="grid grid-cols-4 gap-5">
                <li v-for="stat in salesFunnelStat" :key="stat.title" class="space-y-2 rounded-lg border p-4 shadow">
                    <p class="text-center text-xl font-medium">{{ stat.value }}</p>
                    <p class="text-center text-gray-500">{{ stat.title }}</p>
                </li>
            </ul>

            <div class="grid grid-cols-12">
                <ul class="col-span-2 grid grid-cols-1 gap-4 py-2">
                    <li class="space-y-1 px-2">
                        <p class="truncate rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Qualified</p>
                        <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p>
                    </li>
                    <li class="space-y-1 px-2">
                        <p class="truncate rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Proposal Sent</p>
                        <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p>
                    </li>
                    <li class="space-y-1 px-2">
                        <p class="truncate rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Contract Sent</p>
                        <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p>
                    </li>
                    <li class="space-y-1 px-2">
                        <p class="truncate rounded bg-green-800 px-2 py-1 text-center font-semibold text-white">Won</p>
                        <!-- <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p> -->
                    </li>
                </ul>
                <div class="col-span-10 h-[345px]">
                    <Bar
                        :data="{
                            labels: ['Qualified', 'Proposal Sent', 'Contract Sent', 'Won'],
                            datasets: [
                                {
                                    data: [65, 59, 80, 81],
                                    backgroundColor: [
                                        'rgba(37, 99, 235, 1)',
                                        'rgba(37, 99, 235, 1)',
                                        'rgba(37, 99, 235, 1)',
                                        'rgba(0, 161, 85, 1)',
                                    ],
                                    borderWidth: 0,
                                    borderRadius: 10,
                                    borderSkipped: false,

                                    barPercentage: 1,
                                    categoryPercentage: 0.9,
                                },
                            ],
                        }"
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

        <section v-else-if="reportType === 'activity'" class="grid grid-cols-12 gap-4 bg-base-200 p-4">
            <div class="col-span-8 flex flex-col gap-5">
                <ul class="grid grid-cols-3 gap-5">
                    <li v-for="stat in activityStat" :key="stat.title" class="space-y-2 rounded-lg bg-base-100 p-4 shadow">
                        <p class="text-center text-xl font-medium">{{ stat.value }}</p>
                        <p class="text-center text-gray-500">{{ stat.title }}</p>
                    </li>
                </ul>

                <ul class="grid grid-cols-2 gap-5">
                    <template v-for="chart in doughnutCharts" :key="chart.title">
                        <li v-if="chart.data.labels && chart.data.labels.length > 1" class="rounded bg-base-100 p-4 shadow">
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
                                    <li
                                        v-for="(label, i) in chart.data.labels"
                                        :key="label as string"
                                        class="flex items-center gap-2"
                                    >
                                        <div
                                            :style="`background-color: ${(chart.data.datasets[0].backgroundColor as string[])[i]};`"
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

        <UTable
            v-else-if="reportType === 'performance'"
            by="id"
            :columns="[
                {
                    key: 'name',
                    label: 'Name',
                    sortable: true,
                },
                {
                    key: 'opportunitiesCreated',
                    label: 'Opportunities Created',
                    sortable: true,
                },
                {
                    key: 'opportunitiesWon',
                    label: 'Opportunities Won',
                    sortable: true,
                },
            ]"
            class="w-full"
            :ui="{
                tr: { base: '[&>td]:hover:bg-base-200' },
                th: { base: 'border-x' },
                td: { base: 'max-w-[0] truncate text-default border' },
            }"
            :rows="
                reports?.opportunity_leaderboard.map((data) => ({
                    name: data.name,
                    opportunitiesCreated: data.opportunity_created,
                    opportunitiesWon: data.opportunity_won,
                }))
            "
        />
    </div>
</template>

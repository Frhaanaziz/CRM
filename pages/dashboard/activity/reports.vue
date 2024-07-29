<script setup lang="ts">
import { Line, Doughnut } from 'vue-chartjs';

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

const { data } = await useFetch('/api/reports', {
    key: 'reports',
    query: selectedRangeOption.value?.value,
    headers: useRequestHeaders(['cookie']),
});
console.log('reports', data.value);

const opportunitiesData = computed(() => data.value?.opportunity_data);
const leadsData = computed(() => data.value?.lead_data);

const stats = ref([
    {
        title: 'Act. Revenue',
        value: formatToRupiah(opportunitiesData.value?.total_act_revenue ?? 0),
        percentage: -1,
    },
    {
        title: 'Opportunities Won',
        value: opportunitiesData.value?.total_opportunity_won ?? 0,
        percentage: opportunitiesData.value?.percentage_opportunity_won ?? 0,
    },
    {
        title: 'Avg. Deal Size',
        value: formatToRupiah(-1),
    },
    {
        title: 'New Leads',
        value: leadsData.value?.total_new_leads ?? 0,
        percentage: leadsData.value?.percentage_new_leads ?? 0,
    },
    {
        title: 'New Opportunities',
        value: opportunitiesData.value?.total_new_opportunities ?? 0,
        percentage: opportunitiesData.value?.percentage_new_opportunities ?? 0,
    },
    {
        title: 'Avg. Deal Age (Days)',
        value: -1,
    },
]);

const backgroundColor = ['#3892F3', '#7E84FC', '#15A46E', '#E46F00', '#F75C46', '#AAADB1'];
const generateChartData = (data: Record<string, number>) => {
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
                backgroundColor,
                data: [...percentages, othersPercentage],
            },
        ],
    };
};
function calculateTotalSalesdata(inputData: { date: string; total: number }[]) {
    const sortedData = inputData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    switch (selectedRangeOption.value!.type) {
        case 'daily':
            return generateDailyData(sortedData);
        case 'weekly':
            return generateWeeklyData(sortedData);
        case 'monthly':
            return generateMonthlyData(sortedData);
        case 'yearly':
            return generateYearlyData(sortedData);
        default:
            throw new Error('Invalid range option');
    }
}

function generateDailyData(data: { date: string; total: number }[]) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = { labels: daysOfWeek, data: new Array(7).fill(0) };

    data.forEach((item) => {
        const dayIndex = new Date(item.date).getDay();
        result.data[dayIndex] += item.total;
    });

    return result;
}

function generateWeeklyData(data: { date: string; total: number }[]) {
    const result = { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: new Array(4).fill(0) };

    data.forEach((item) => {
        const date = new Date(item.date);
        const weekIndex = Math.floor((date.getDate() - 1) / 7);
        result.data[weekIndex] += item.total;
    });

    return result;
}

function generateMonthlyData(data: { date: string; total: number }[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = { labels: months, data: new Array(12).fill(0) };

    data.forEach((item) => {
        const monthIndex = new Date(item.date).getMonth();
        result.data[monthIndex] += item.total;
    });

    return result;
}

function generateYearlyData(data: { date: string; total: number }[]) {
    const years = new Set(data.map((item) => new Date(item.date).getFullYear()));
    const sortedYears = Array.from(years).sort();
    const result = { labels: sortedYears.map(String), data: new Array(sortedYears.length).fill(0) };

    data.forEach((item) => {
        const year = new Date(item.date).getFullYear();
        const yearIndex = sortedYears.indexOf(year);
        result.data[yearIndex] += item.total;
    });

    return result;
}

const doughnutCharts = ref([
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
</script>

<template>
    <div>
        <header class="p-4">
            <h1 class="text-2xl font-semibold">Reports</h1>
        </header>

        <section class="bg-base-200 px-4 pt-4">
            <USelectMenu v-model="selectedRange" :options="rangeOptions" value-attribute="id" class="w-80" />
            <p class="mt-[10px] px-2">April 2024 vs March 2024</p>
        </section>

        <section class="grid grid-cols-12 gap-4 bg-base-200 p-4">
            <div class="col-span-8 flex flex-col gap-4">
                <div class="grid grid-cols-3 gap-4">
                    <div v-for="stat in stats" :key="stat.title" class="rounded bg-base-100 p-4 shadow">
                        <p>{{ stat.title }}</p>
                        <p class="text-4xl font-semibold">{{ stat.value }}</p>
                        <div v-if="stat.percentage" class="mt-1 flex items-center gap-1">
                            <UIcon
                                :name="stat.percentage > 0 ? 'i-heroicons-arrow-up-20-solid' : 'i-heroicons-arrow-down-20-solid'"
                                :class="[stat.percentage > 0 ? 'text-green-700' : 'text-red-600']"
                                class="h-5 w-5"
                            />
                            <p>
                                <span
                                    class="font-semibold"
                                    :class="['text-sm', stat.percentage > 0 ? 'text-green-700' : 'text-red-600']"
                                >
                                    {{ stat.percentage }}%
                                </span>
                                vs last month
                            </p>
                        </div>
                    </div>
                </div>

                <div v-if="opportunitiesData" class="rounded bg-base-100 p-4 shadow">
                    <h2 class="mb-6 text-xl font-semibold">Monthly Sales</h2>
                    <Line
                        :options="{
                            elements: {
                                line: {
                                    // Smoothen the line
                                    tension: 0.4,
                                },
                            },
                            scales: {
                                x: {
                                    border: {
                                        // Hide the x-axis border
                                        display: false,
                                    },
                                    grid: {
                                        // Hide the x-axis grid lines
                                        display: false,
                                    },
                                },

                                y: {
                                    border: {
                                        // Hide the y-axis border
                                        display: false,
                                    },
                                },
                            },
                            interaction: {
                                mode: 'index',
                                intersect: false,
                            },
                        }"
                        :data="{
                            labels: calculateTotalSalesdata(opportunitiesData.total_sales).labels,
                            datasets: [
                                {
                                    data: calculateTotalSalesdata(opportunitiesData.total_sales).data,
                                    borderColor: '#15A46E',
                                    fill: 'start',
                                    borderWidth: 1.5,

                                    // Hide the points
                                    pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                                    pointBorderColor: 'rgba(0, 0, 0, 0)',

                                    gradient: {
                                        backgroundColor: {
                                            axis: 'y',
                                            colors: {
                                                0: 'rgba(0, 143, 93, 0.01)',
                                                100: 'rgba(0, 143, 93, 0.1)',
                                            },
                                        },
                                    },
                                },
                            ],
                        }"
                    />
                </div>

                <div class="rounded bg-base-100 p-4 shadow">
                    <h2 class="mb-6 text-xl font-semibold">This Month's Leaderboard</h2>
                    <UTable
                        :rows="
                            opportunitiesData?.opportunity_leaderboard.map(({ name, total }) => ({
                                user: name,
                                revenue: total,
                            })) ?? []
                        "
                    />
                </div>
            </div>

            <ul class="col-span-4 space-y-4">
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

                            <div class="col-span-3 space-y-2">
                                <div v-for="(label, i) in chart.data.labels" :key="label" class="flex items-center gap-2">
                                    <div
                                        :style="`background-color: ${chart.data.datasets[0].backgroundColor[i]};`"
                                        class="h-3 w-3 rounded"
                                    ></div>
                                    <p class="text-xs">{{ label }}</p>
                                </div>
                            </div>
                        </div>
                    </li>
                </template>
            </ul>
        </section>
    </div>
</template>

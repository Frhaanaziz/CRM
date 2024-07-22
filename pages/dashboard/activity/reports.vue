<script setup lang="ts">
import { Line, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Filler, Tooltip, LineElement, PointElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import gradient from 'chartjs-plugin-gradient';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    gradient,

    // Area CHART
    Filler,

    // Doughnut CHART
    ArcElement
);

const range = ref('This Month');

const doughnutCharts = ref([
    {
        title: 'Leads By Rating',
        data: {
            labels: ['Cold', 'Warm', 'Hot'],
            datasets: [
                {
                    backgroundColor: ['#3892F3', '#E46F00', '#F75C46'],
                    data: [55, 20, 25],
                },
            ],
        },
    },
    {
        title: 'Deals Lost Reason',
        data: {
            labels: ['Pricing', 'Competition', 'Long Sales Cycle', 'Communication', 'Decision Making', 'Others'],
            datasets: [
                {
                    backgroundColor: ['#3892F3', '#7E84FC', '#15A46E', '#E46F00', '#F75C46', '#AAADB1'],
                    data: [30, 20, 15, 10, 10, 15],
                },
            ],
        },
    },
    {
        title: 'Leads By Industry',
        data: {
            labels: ['Manufacturing', 'Logistics and Supply Chain', 'Healthcare', 'Others'],
            datasets: [
                {
                    backgroundColor: ['#3892F3', '#7E84FC', '#15A46E', '#E46F00'],
                    data: [30, 20, 15, 35],
                },
            ],
        },
    },
    {
        title: 'Leads By Size',
        data: {
            labels: ['101-200', '201-1000', '>1000'],
            datasets: [
                {
                    backgroundColor: ['#3892F3', '#7E84FC', '#15A46E'],
                    data: [30, 20, 50],
                },
            ],
        },
    },
    {
        title: 'Leads By Country',
        data: {
            labels: ['Indonesia', 'Singapore', 'Malaysia'],
            datasets: [
                {
                    backgroundColor: ['#3892F3', '#7E84FC', '#15A46E'],
                    data: [10, 30, 50],
                },
            ],
        },
    },
]);
const stats = ref([
    {
        title: 'Act. Revenue',
        value: formatToRupiah(300_000_000),
        percentage: 28,
    },
    {
        title: 'Opportunities Won',
        value: 20,
        percentage: -5,
    },
    {
        title: 'Avg. Deal Size',
        value: formatToRupiah(15_000_000),
    },
    {
        title: 'New Leads',
        value: 100,
        percentage: 28,
    },
    {
        title: 'New Opportunities',
        value: 55,
        percentage: -5,
    },
    {
        title: 'Avg. Deal Age (Days)',
        value: 40,
    },
]);

const people = [
    {
        user: 'Tiana Calzoni',
        revenue: 'Rp80jt',
        // revenue: { value: 'Rp80jt', class: 'w-[120px]' },
    },
    {
        user: 'Livia Septimus',
        revenue: 'Rp60jt',
    },
    {
        user: 'Zain Carder',
        revenue: 'Rp54jt',
    },
    {
        user: 'Angel Westervelt',
        revenue: 'Rp44jt',
    },
    {
        user: 'Brandon Mango',
        revenue: 'Rp40jt',
    },
    {
        user: 'Alena Rosser',
        revenue: 'Rp32jt',
    },
    {
        user: 'Alfonso Torff',
        revenue: 'Rp30jt',
    },
    {
        user: 'Dulce Westervelt',
        revenue: 'Rp25jt',
    },
    {
        user: 'Erin Gouse',
        revenue: 'Rp22jt',
    },
    {
        user: 'Kianna Calzoni',
        revenue: 'Rp12jt',
    },
];
</script>

<template>
    <div>
        <header class="p-4">
            <h1 class="text-2xl font-semibold">Reports</h1>
        </header>

        <section class="bg-base-200 px-4 pt-4">
            <USelectMenu
                v-model="range"
                :options="['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'This Year', 'Last Year']"
                class="w-80"
            />
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

                <div class="rounded bg-base-100 p-4 shadow">
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
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            datasets: [
                                {
                                    data: [65, 59, 80, 81, 56, 55, 40, 60, 65, 59, 80, 81],
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
                    <UTable :rows="people" />
                </div>
            </div>

            <ul class="col-span-4 space-y-4">
                <li v-for="chart in doughnutCharts" :key="chart.title" class="rounded bg-base-100 p-4 shadow">
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
            </ul>
        </section>
    </div>
</template>

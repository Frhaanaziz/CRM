<script lang="ts" setup>
import { Bar } from 'vue-chartjs';
defineProps<{
    range: {
        start_date: string;
        end_date: string;
    };
}>();

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
]);
</script>

<template>
    <section class="space-y-10 p-4">
        <ul class="grid grid-cols-4 gap-5">
            <li v-for="stat in stats" :key="stat.title" class="space-y-2 rounded-lg border p-4 shadow">
                <p class="text-center text-xl font-medium">{{ stat.value }}</p>
                <p class="text-center text-gray-500">{{ stat.title }}</p>
            </li>
        </ul>

        <div class="grid grid-cols-12">
            <ul class="col-span-1 grid grid-cols-1 py-2">
                <li class="space-y-1 px-2">
                    <p class="rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Qualified</p>
                    <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p>
                </li>
                <li class="space-y-1 px-2">
                    <p class="rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Proposal Sent</p>
                    <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p>
                </li>
                <li class="space-y-1 px-2">
                    <p class="rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Contract Sent</p>
                    <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p>
                </li>
                <li class="space-y-1 px-2">
                    <p class="rounded bg-blue-800 px-2 py-1 text-center font-semibold text-white">Won</p>
                    <!-- <p class="px-2 py-1 text-center font-semibold text-gray-500">70 Days</p> -->
                </li>
            </ul>
            <div class="col-span-11 h-[345px]">
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
            :rows="[
                {
                    stage: 'Qualififed',
                    count: 20,
                    value: 'Rp. 200.000.000',
                    ['weighted value']: 'Rp. 100.000.000',
                    ['avg time to advance']: '70 Days',
                    ['conversion rate']: '60%',
                    lost: 0,
                },
                {
                    stage: 'Proposal Sent',
                    count: 18,
                    value: 'Rp. 200.000.000',
                    ['weighted value']: 'Rp. 100.000.000',
                    ['avg time to advance']: '70 Days',
                    ['conversion rate']: '20%',
                    lost: 0,
                },
                {
                    stage: 'Contract Sent',
                    count: 14,
                    value: 'Rp. 200.000.000',
                    ['weighted value']: 'Rp. 100.000.000',
                    ['avg time to advance']: '70 Days',
                    ['conversion rate']: '10%',
                    lost: 1,
                },
                {
                    stage: 'Won',
                    count: 12,
                    value: 'Rp. 200.000.000',
                    ['weighted value']: 'Rp. 100.000.000',
                    ['avg time to advance']: '70 Days',
                    ['conversion rate']: '20%',
                    lost: 0,
                },
            ]"
        />
    </section>
</template>

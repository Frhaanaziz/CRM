<script setup lang="ts">
import type { HorizontalNavigationLink } from '#ui/types';

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
            <!-- <USelectMenu v-model="userType" :options="userTypeOptions">
                <template #leading>
                    <UIcon name="i-heroicons-user" class="h-5 w-5" />
                </template>
            </USelectMenu> -->
        </section>

        <ReportSalesFunnel v-if="reportType === 'sales'" v-bind="selectedRangeOption.value" />
        <ReportActivityOverview v-else-if="reportType === 'activity'" v-bind="selectedRangeOption.value" />
        <ReportPerformanceComparison v-else-if="reportType === 'performance'" v-bind="selectedRangeOption.value" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    start_date: string;
    end_date: string;
}>();

const { data: reports, status } = await useLazyFetch('/api/reports/performance-comparison', {
    query: props,
});
watchEffect(() => console.log('performance', reports.value));
</script>

<template>
    <UTable
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
            {
                key: 'callsDuration',
                label: 'Calls Duration',
                sortable: true,
            },
            {
                key: 'callsConnected',
                label: 'Calls Connected',
                sortable: true,
            },
        ]"
        :rows="
            reports?.map((data: any) => ({
                name: data.name,
                opportunitiesCreated: data.total_opportunity,
                opportunitiesWon: data.total_opportunity_won,
                callsDuration: data.call_duration,
                callsConnected: data.call_connected,
            })) ?? []
        "
        :loading="status === 'pending'"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            th: { base: 'border-x' },
            td: { base: 'max-w-[0] truncate text-default border' },
        }"
    />
</template>

<script lang="ts" setup>
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

        <UTable
            :rows="// opportunitiesData?.opportunity_leaderboard.map(({ name, total }) => ({
            //     user: name,
            //     revenue: total,
            // })) ?? []
            [
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

<script lang="ts" setup>
defineProps<{
    range: {
        start_date: string;
        end_date: string;
    };
}>();

const columns = [
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
        key: 'calls',
        label: 'Calls',
        sortable: true,
    },
    {
        key: 'callsConnected',
        label: 'Calls Connected',
        sortable: true,
    },
    {
        key: 'sentEmails',
        label: 'Sent Emails',
        sortable: true,
    },
    {
        key: 'receivedEmails',
        label: 'Received Emails',
        sortable: true,
    },
];

const rows = [
    {
        name: 'Whitney Francis',
        opportunitiesCreated: 12,
        opportunitiesWon: 5,
        calls: 78,
        callsConnected: 45,
        sentEmails: 120,
        receivedEmails: 85,
    },
    {
        name: 'Jared Patel',
        opportunitiesCreated: 8,
        opportunitiesWon: 3,
        calls: 62,
        callsConnected: 38,
        sentEmails: 95,
        receivedEmails: 72,
    },
    {
        name: 'Samantha Lee',
        opportunitiesCreated: 15,
        opportunitiesWon: 7,
        calls: 90,
        callsConnected: 55,
        sentEmails: 150,
        receivedEmails: 110,
    },
    {
        name: 'Michael Chen',
        opportunitiesCreated: 10,
        opportunitiesWon: 4,
        calls: 70,
        callsConnected: 42,
        sentEmails: 110,
        receivedEmails: 80,
    },
    {
        name: 'Emily Rodriguez',
        opportunitiesCreated: 14,
        opportunitiesWon: 6,
        calls: 85,
        callsConnected: 50,
        sentEmails: 130,
        receivedEmails: 95,
    },
    {
        name: 'David Kim',
        opportunitiesCreated: 9,
        opportunitiesWon: 4,
        calls: 65,
        callsConnected: 40,
        sentEmails: 100,
        receivedEmails: 75,
    },
    {
        name: 'Sarah Johnson',
        opportunitiesCreated: 11,
        opportunitiesWon: 5,
        calls: 75,
        callsConnected: 44,
        sentEmails: 115,
        receivedEmails: 88,
    },
    {
        name: 'Alex Thompson',
        opportunitiesCreated: 13,
        opportunitiesWon: 6,
        calls: 82,
        callsConnected: 48,
        sentEmails: 125,
        receivedEmails: 92,
    },
    {
        name: 'Rachel Nguyen',
        opportunitiesCreated: 7,
        opportunitiesWon: 3,
        calls: 58,
        callsConnected: 35,
        sentEmails: 90,
        receivedEmails: 68,
    },
    {
        name: 'Daniel Garcia',
        opportunitiesCreated: 16,
        opportunitiesWon: 8,
        calls: 95,
        callsConnected: 58,
        sentEmails: 160,
        receivedEmails: 120,
    },
];
</script>

<template>
    <UTable
        by="id"
        :columns
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
        :rows
    />
</template>

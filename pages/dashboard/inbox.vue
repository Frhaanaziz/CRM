<script lang="ts" setup>
import type { HorizontalNavigationLink, TabItem } from '#ui/types';
const tabItems: TabItem[] = [
    {
        label: 'All',
        slot: 'all',
    },
    {
        label: 'Unread',
        slot: 'unread',
    },
];
const selectedTab = ref(tabItems[0]);

const activeFilter = ref<'all' | 'emails' | 'calls' | 'tasks'>('all');
const links = computed<HorizontalNavigationLink[]>(() => [
    {
        label: 'All Inbox',
        icon: 'i-heroicons-inbox',
        active: activeFilter.value === 'all',
        click: () => (activeFilter.value = 'all'),
        // badge: 100,
    },
    {
        label: 'Emails',
        icon: 'i-heroicons-envelope',
        active: activeFilter.value === 'emails',
        click: () => (activeFilter.value = 'emails'),
    },
    {
        label: 'Calls',
        icon: 'i-heroicons-phone',
        active: activeFilter.value === 'calls',
        click: () => (activeFilter.value = 'calls'),
    },
    {
        label: 'Tasks',
        icon: 'i-heroicons-calendar',
        active: activeFilter.value === 'tasks',
        click: () => (activeFilter.value = 'tasks'),
    },
]);

const inboxes = [
    {
        id: 1,
        status: 'readed',
        type: 'email',
        from: 'Alex Smith',
        subject: 'Need sales Services',
        message:
            "I've attached the new proposal for our next project. It outlines all the objectives, timelines, and resource allocations. I'm particularly excited about the innovative approach we're taking this time. Please have a look and let me know your thoughts.",
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        status: 'unread',
        type: 'missed-call',
        subject: 'Missed Call',
        message: '+62 812 1234 5678 78',
        created_at: new Date().toISOString(),
    },
    {
        id: 3,
        status: 'unread',
        type: 'task',
        from: 'Pipeline',
        subject: 'Follow up Anthony',
        created_at: new Date().toISOString(),
    },
];
const filteredInboxes = computed(() => {
    const selectedInboxes = inboxes.filter((inbox) => {
        if (selectedTab.value.slot === 'all') return true;
        if (selectedTab.value.slot === 'unread') return inbox.status === 'unread';
        return true;
    });

    if (activeFilter.value === 'all') return selectedInboxes;
    if (activeFilter.value === 'emails') return selectedInboxes.filter((inbox) => inbox.type === 'email');
    if (activeFilter.value === 'calls') return selectedInboxes.filter((inbox) => inbox.type === 'missed-call');
    if (activeFilter.value === 'tasks') return selectedInboxes.filter((inbox) => inbox.type === 'task');
    return selectedInboxes;
});
</script>

<template>
    <div>
        <header class="flex items-center justify-between p-4">
            <h1 class="font-semibold">Inbox</h1>
            <UTabs :items="tabItems" @change="(index) => (selectedTab = tabItems[index])" />
        </header>

        <UDivider />

        <UHorizontalNavigation :links="links" />
        <ul>
            <li v-for="inbox in filteredInboxes" :key="inbox.id" class="grid grid-cols-12 border-b p-4">
                <div class="col-span-2 flex items-center gap-4">
                    <UCheckbox />

                    <UIcon v-if="inbox.type === 'email'" name="i-heroicons-envelope" class="h-5 w-5 shrink-0 text-brand" />
                    <UIcon v-else-if="inbox.type === 'task'" name="i-heroicons-calendar" class="h-5 w-5 shrink-0 text-brand" />
                    <UIcon
                        v-else-if="inbox.type === 'missed-call'"
                        name="i-heroicons-phone-x-mark"
                        class="h-5 w-5 shrink-0 text-red-500"
                    />

                    <UButton
                        v-if="inbox.type === 'missed-call'"
                        icon="i-heroicons-plus"
                        color="white"
                        size="2xs"
                        class="shrink-0"
                    >
                        Create Lead
                    </UButton>
                    <p class="shrink-0 text-sm" :class="{ 'font-semibold': inbox.status !== 'readed' }">{{ inbox.from }}</p>
                </div>

                <p class="col-span-9 truncate text-sm" :class="{ 'font-semibold': inbox.status !== 'readed' }">
                    Need sales Services
                    <span class="text-gray-400">
                        - I've attached the new proposal for our next project. It outlines all the objectives, timelines, and
                        resource allocations. I'm particularly excited about the innovative approach we're taking this time.
                        Please have a look and let me know your thoughts.</span
                    >
                </p>

                <NuxtTime
                    class="text-right text-sm"
                    :class="{ 'font-semibold': inbox.status !== 'readed' }"
                    :datetime="inbox.created_at"
                    month="short"
                    day="2-digit"
                    year="2-digit"
                />
            </li>
        </ul>
    </div>
</template>

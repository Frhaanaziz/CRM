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

const { data: inboxes } = await useFetch('/api/inboxes', { key: 'inboxes', headers: useRequestHeaders(['cookie']) });

const filteredInboxes = computed(() => {
    const selectedInboxes = inboxes.value?.filter((inbox) => {
        if (selectedTab.value.slot === 'all') return true;
        if (selectedTab.value.slot === 'unread') return inbox.is_read;
        return true;
    });

    if (activeFilter.value === 'all') return selectedInboxes;
    if (activeFilter.value === 'emails') return selectedInboxes?.filter((inbox) => inbox.type === 'email');
    if (activeFilter.value === 'calls') return selectedInboxes?.filter((inbox) => inbox.type === 'call');
    if (activeFilter.value === 'tasks') return selectedInboxes?.filter((inbox) => inbox.type === 'task');
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
                        v-else-if="inbox.type === 'call'"
                        name="i-heroicons-phone-x-mark"
                        class="h-5 w-5 shrink-0 text-red-500"
                    />

                    <UButton v-if="inbox.type === 'call'" icon="i-heroicons-plus" color="white" size="2xs" class="shrink-0">
                        Create Lead
                    </UButton>

                    <NuxtLink
                        v-if="inbox.type === 'task' && inbox.task?.lead_id"
                        :href="`/dashboard/pipeline/leads/${inbox.task.lead_id}`"
                        class="shrink-0 text-sm text-brand"
                        :class="{ 'font-semibold': !inbox.is_read }"
                    >
                        {{ inbox.title }}
                    </NuxtLink>
                    <p v-else class="shrink-0 text-sm" :class="{ 'font-semibold': !inbox.is_read }">{{ inbox.title }}</p>
                </div>

                <p class="col-span-9 truncate text-sm" :class="{ 'font-semibold': !inbox.is_read }">
                    {{ inbox.subject }}
                    <span v-if="inbox.description" class="text-gray-400"> - {{ inbox.description }}</span>
                </p>

                <!-- isToday -->
                <NuxtTime
                    v-if="new Date(inbox.created_at).toDateString() === new Date().toDateString()"
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !inbox.is_read }"
                    :datetime="inbox.created_at"
                    hour="numeric"
                    minute="2-digit"
                />
                <!-- isThisYear -->
                <NuxtTime
                    v-else-if="new Date(inbox.created_at).getFullYear() === new Date().getFullYear()"
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !inbox.is_read }"
                    :datetime="inbox.created_at"
                    month="short"
                    day="numeric"
                />
                <NuxtTime
                    v-else
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !inbox.is_read }"
                    :datetime="inbox.created_at"
                    month="short"
                    day="numeric"
                    year="numeric"
                />
            </li>
        </ul>
    </div>
</template>

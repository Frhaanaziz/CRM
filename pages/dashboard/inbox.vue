<script lang="ts" setup>
import type { HorizontalNavigationLink, TabItem } from '#ui/types';
import type { z } from 'zod';

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

const type = ref<'email' | 'call' | 'task' | undefined>();
const is_read = ref<boolean | undefined>();
const links = computed<HorizontalNavigationLink[]>(() => [
    {
        label: 'All Inbox',
        icon: 'i-heroicons-inbox',
        active: type.value === undefined,
        click: () => (type.value = undefined),
        // badge: 100,
    },
    {
        label: 'Emails',
        icon: 'i-heroicons-envelope',
        active: type.value === 'email',
        click: () => (type.value = 'email'),
    },
    {
        label: 'Calls',
        icon: 'i-heroicons-phone',
        active: type.value === 'call',
        click: () => (type.value = 'call'),
    },
    {
        label: 'Tasks',
        icon: 'i-heroicons-calendar',
        active: type.value === 'task',
        click: () => (type.value = 'task'),
    },
]);

const { columns, selectedRows, selectRow, page, pageSize, sort } = useDataTable({
    columns: [
        { key: 'type', label: 'Type' },
        { key: 'subject', label: 'Subject' },
        { key: 'created_at', label: 'Created on' },
    ],
    initialColumnKeys: ['type', 'title', 'subject', 'created_at'],
});
const selectedUnreadRows = computed(() =>
    selectedRows.value.filter((row) => inboxesPaginated.value?.result.find((inbox) => inbox.id === row.id)?.is_read === false)
);

const {
    data: inboxesPaginated,
    status,
    refresh,
} = await useLazyFetch('/api/inboxes', {
    query: {
        page,
        limit: pageSize,
        sort: computed(() => sort.value.column),
        order: computed(() => sort.value.direction),
        type,
        is_read,
    },
    headers: useRequestHeaders(['cookie']),
});

const isCreatingLead = ref(false);
const isReadingInbox = ref(false);
async function createLead(number: string) {
    try {
        isCreatingLead.value = true;

        // await $fetch('/api/leads', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         title: 'New Lead',
        //         description: 'New Lead Description',
        //     }),
        // });

        toast.success('Lead created successfully');
    } catch (error) {
        console.error('Error creating lead', error);
        toast.error('Failed to create lead, please try again later.');
    }
}
async function readInbox(data: z.infer<typeof readInboxSchema>) {
    try {
        isReadingInbox.value = true;

        await $fetch(`/api/inboxes`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        await refresh();
        selectedRows.value = [];
    } catch (error) {
        console.error('Error reading inbox', error);
        toast.error('Failed to read inbox, please try again later.');
    } finally {
        isReadingInbox.value = false;
    }
}
</script>

<template>
    <div>
        <header class="flex items-center justify-between p-4">
            <h1 class="font-semibold">Inbox</h1>
            <UTabs :items="tabItems" @change="(index) => (is_read = tabItems[index].slot === 'unread' ? false : undefined)" />
        </header>

        <UDivider />

        <div class="flex items-center justify-between">
            <UHorizontalNavigation :links="links" />

            <div v-if="inboxesPaginated" class="flex shrink-0 items-center gap-4 px-4">
                <!-- Mark as read button -->
                <UButton
                    v-if="selectedUnreadRows.length > 0"
                    color="white"
                    size="xs"
                    icon="i-heroicons-envelope-open"
                    :disabled="isReadingInbox"
                    @click="readInbox({ ids: selectedUnreadRows.map((row) => Number(row.id)) })"
                >
                    Mark as Read
                </UButton>

                <template v-if="inboxesPaginated.total_page > 1">
                    <UButton
                        icon="i-heroicons-chevron-left"
                        color="white"
                        size="xs"
                        :disabled="inboxesPaginated.is_first_page"
                        @click="page = inboxesPaginated.prev_page"
                    />
                    <UButton
                        icon="i-heroicons-chevron-right"
                        color="white"
                        size="xs"
                        :disabled="inboxesPaginated.is_last_page"
                        @click="page = inboxesPaginated.next_page"
                    />
                </template>
            </div>
        </div>

        <UTable
            v-model="selectedRows"
            by="id"
            :loading="status === 'pending'"
            :rows="
                inboxesPaginated?.result.map((inbox) => ({
                    ...inbox,
                    subject: { value: inbox.subject, class: '' },
                    // created_at: { value: inbox.created_at, class: 'w-56 max-w-56' },
                })) ?? []
            "
            :columns
            sort-mode="manual"
            class="w- w-full"
            :ui="{
                tr: { base: '[&>td]:hover:bg-base-200' },
                td: { base: 'truncate text-default' },
                th: { base: 'text-nowrap' },
            }"
            @select="selectRow"
        >
            <template #type-data="{ row }">
                <div class="flex items-center gap-4">
                    <UIcon v-if="row.type === 'email'" name="i-heroicons-envelope" class="h-5 w-5 shrink-0 text-brand" />
                    <UIcon v-else-if="row.type === 'task'" name="i-heroicons-calendar" class="h-5 w-5 shrink-0 text-brand" />
                    <UIcon
                        v-else-if="row.type === 'call'"
                        name="i-heroicons-phone-x-mark"
                        class="h-5 w-5 shrink-0 text-red-500"
                    />

                    <UButton
                        v-if="row.type === 'call'"
                        icon="i-heroicons-plus"
                        color="white"
                        size="2xs"
                        class="shrink-0"
                        disabled
                        @click="createLead"
                    >
                        Create Lead
                    </UButton>
                    <NuxtLink
                        v-else-if="row.type === 'task' && row.task?.lead_id"
                        :href="`/dashboard/pipeline/leads/${row.task.lead_id}`"
                        class="shrink-0 text-sm text-brand"
                        :class="{ 'font-semibold': !row.is_read }"
                        @click="readInbox({ ids: [row.id] })"
                    >
                        {{ row.title }}
                    </NuxtLink>
                    <p v-else class="shrink-0 text-sm" :class="{ 'font-semibold': !row.is_read }">
                        {{ row.type === 'email' ? row.title.split(' <')?.at(0) : row.title }}
                    </p>
                </div>
            </template>

            <template #subject-data="{ row }">
                <p class="text-sm" :class="{ 'font-semibold': !row.is_read }">
                    {{ row.subject.value }}
                    <span v-if="row.description" class="text-gray-400"> - {{ truncateString(row.description, 100) }}</span>
                </p>
            </template>

            <template #created_at-data="{ row }">
                <!-- isToday  -->
                <NuxtTime
                    v-if="new Date(row.created_at).toDateString() === new Date().toDateString()"
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !row.is_read }"
                    :datetime="row.created_at"
                    hour="numeric"
                    minute="2-digit"
                />
                <!-- isThisYear  -->
                <NuxtTime
                    v-else-if="new Date(row.created_at).getFullYear() === new Date().getFullYear()"
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !row.is_read }"
                    :datetime="row.created_at"
                    month="short"
                    day="numeric"
                />
                <NuxtTime
                    v-else
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !row.is_read }"
                    :datetime="row.created_at"
                    month="short"
                    day="numeric"
                    year="numeric"
                />
            </template>

            <template #empty-state>
                <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                    <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                    <p>No inboxes found</p>
                </div>
            </template>
        </UTable>
        <!-- <ul>
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
                    <p v-else class="shrink-0 text-sm" :class="{ 'font-semibold': !inbox.is_read }">
                        {{ inbox.title.split(' <')?.at(0) }}
                    </p>
                </div>

                <p class="col-span-9 truncate text-sm" :class="{ 'font-semibold': !inbox.is_read }">
                    {{ inbox.subject }}
                    <span v-if="inbox.description" class="text-gray-400"> - {{ inbox.description }}</span>
                </p>

               isToday 
                <NuxtTime
                    v-if="new Date(inbox.created_at).toDateString() === new Date().toDateString()"
                    class="text-right text-sm"
                    :class="{ 'font-semibold': !inbox.is_read }"
                    :datetime="inbox.created_at"
                    hour="numeric"
                    minute="2-digit"
                />
               isThisYear 
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
        </ul> -->
    </div>
</template>

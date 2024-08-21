<script lang="ts" setup>
import Draggable from 'vuedraggable';

const isReordering = ref(false);
const drag = ref(false);
const dragOptions = computed(() => ({
    animation: 200,
    disabled: isReordering.value,
    ghostClass: 'opacity-50',
}));

const leadStatuses = ref([
    { id: 1, name: 'Inbound - Trial' },
    { id: 2, name: 'Inbound - Trial Expired' },
    { id: 3, name: 'Outbound - Potential' },
    { id: 4, name: 'Outbound - Interested' },
    { id: 5, name: 'Outbound - Qualified' },
    { id: 6, name: 'Customer' },
    { id: 7, name: 'Canceled' },
    { id: 8, name: 'Bad Fit' },
    { id: 9, name: 'Not Interested' },
]);

async function onUpdate({ newIndex }: { newIndex: number; oldIndex: number }) {
    // if (!opportunityStatuses.value) return;
    // try {
    //     isReordering.value = true;
    //     // index_number of the task above the dragged and dropped task
    //     const prevElIndexNumber = opportunityStatuses.value[newIndex - 1]?.index_number;
    //     // index_number of the task under the dragged and dropped task
    //     const nextElIndexNumber = opportunityStatuses.value[newIndex + 1]?.index_number;
    //     await $fetch(`/api/opportunity-statuses/${opportunityStatuses.value[newIndex].id}/reorder`, {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             prevElIndexNumber,
    //             nextElIndexNumber,
    //         }),
    //     });
    // } catch (error) {
    //     console.error('Error updating opportunity status:', error);
    //     toast.error('Failed to reorder opportunity status, please try again later.');
    // } finally {
    //     isReordering.value = false;
    // }
}
</script>

<template>
    <div>
        <header class="border-b px-4 py-6">
            <h1 class="font-semibold">Lead Settings</h1>
        </header>

        <section class="border-b p-4">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="font-semibold">Lead Priority</h2>
                    <p class="text-xs">Categorize your company leads based on their urgency</p>
                </div>
                <UButton variant="outline" icon="i-heroicons-plus" disabled>Add Priority</UButton>
            </div>

            <UTable
                :columns="[
                    { key: 'icon', label: 'Icon' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'company_size', label: 'Company Size' },
                    { key: 'industry', label: 'Industry' },
                    { key: 'job_title', label: 'Job Title' },
                    { key: 'location', label: 'Location' },
                    { key: 'source', label: 'Source' },
                    { key: 'action' },
                ]"
                :rows="[
                    {
                        icon: '#00C16A',
                        priority: 'High',
                        company_size: '100+',
                        industry: 'Technology',
                        job_title: ['Director', 'Manager'],
                        location: 'Bandung, ID',
                        source: ['Hubspot', 'Manual'],
                    },
                    {
                        icon: '#F59E0B',
                        priority: 'Medium',
                        company_size: '50+',
                        industry: 'Finance',
                        job_title: ['Manager'],
                        location: 'Jakarta, ID',
                        source: ['Hubspot'],
                    },
                    {
                        icon: '#64748B',
                        priority: 'Low',
                        company_size: '20+',
                        industry: 'Health',
                        job_title: ['Staff'],
                        location: 'Surabaya, ID',
                        source: ['Manual'],
                    },
                ]"
                class="mt-4"
                :ui="{
                    wrapper: 'border rounded-lg',
                    tr: { base: '[&>td]:hover:bg-base-200' },
                    td: { base: 'truncate text-default' },
                    th: {
                        color: 'text-default',
                        font: 'font-semibold',
                    },
                }"
            >
                <template #icon-data="{ row }">
                    <div :style="`background-color: ${row.icon};`" class="h-5 w-5 rounded-full"></div>
                </template>
                <template #job_title-data="{ row }">
                    <ul class="list-disc">
                        <li v-for="job in row.job_title" :key="job">
                            {{ job }}
                        </li>
                    </ul>
                </template>
                <template #source-data="{ row }">
                    <ul class="list-disc">
                        <li v-for="source in row.source" :key="source">
                            {{ source }}
                        </li>
                    </ul>
                </template>
                <template #action-data>
                    <div class="space-x-4 text-gray-500">
                        <UButton square variant="ghost" color="white" icon="i-heroicons-pencil" disabled />
                        <UButton square variant="ghost" color="white" icon="i-heroicons-trash" disabled />
                    </div>
                </template>
            </UTable>
        </section>

        <section class="p-4">
            <h2 class="font-semibold">Lead Statuses</h2>
            <p class="text-xs">Lead status that represent your company currrent relationship to your company</p>

            <div class="mt-4 max-w-sm space-y-2 rounded-lg border p-2">
                <h3 class="text-sm font-semibold">Leads</h3>
                <div class="flex items-center justify-between gap-1">
                    <UInput placeholder="Status Name" class="grow" />
                    <UButton icon="i-heroicons-plus">Add Status</UButton>
                </div>

                <Draggable
                    :list="leadStatuses"
                    :component-data="{
                        tag: 'ul',
                        type: 'transition-group',
                        name: !drag ? 'flip-list' : null,
                    }"
                    handle=".handle"
                    item-key="id"
                    v-bind="dragOptions"
                    @start="drag = true"
                    @end="drag = false"
                    @update="onUpdate"
                >
                    <template #item="{ element, index }">
                        <li class="flex items-center gap-2 py-2 pr-2">
                            <UButton
                                square
                                variant="ghost"
                                color="white"
                                icon="i-heroicons-bars-3"
                                class="handle cursor-move"
                                :padded="false"
                            />
                            <span>{{ index + 1 }}</span>
                            <p class="grow">{{ element.name }}</p>
                            <UButton icon="i-heroicons-pencil" square variant="ghost" color="white" disabled :padded="false" />
                            <UButton icon="i-heroicons-trash" square variant="ghost" color="white" disabled :padded="false" />
                        </li>
                    </template>
                </Draggable>
                <!-- <ul class="space-y-2">
                    <li class="flex items-center gap-2 py-2 pr-2">
                        <UButton
                            square
                            variant="ghost"
                            color="white"
                            disabled
                            icon="i-heroicons-bars-3"
                            class="cursor-move"
                            :padded="false"
                        />
                        <span>1</span>
                        <p class="grow">Inbound - Trial</p>
                        <UButton icon="i-heroicons-pencil" square variant="ghost" color="white" disabled :padded="false" />
                        <UButton icon="i-heroicons-trash" square variant="ghost" color="white" disabled :padded="false" />
                    </li>
                </ul> -->
            </div>
        </section>
    </div>
</template>

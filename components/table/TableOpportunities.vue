<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { Opportunity } from '~/types';

const emit = defineEmits(['select']);

defineProps<{
    opportunitiesRows: any[];
    pending: boolean;
    columns: any[];
    totalRows: number;
}>();

const selectedRows = defineModel('selectedRows', { type: Array, required: true });
const sort = defineModel('sort', { type: Object, required: true });
const page = defineModel('page', { type: Number, required: true });
const pageCount = defineModel('pageCount', { type: Number, required: true });
</script>

<template>
    <!-- Table -->
    <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        by="id"
        :loading="pending"
        :rows="opportunitiesRows"
        :columns
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
        @select="(v: Pick<Opportunity, 'id'>) => emit('select', v)"
    >
        <template #topic-data="{ row }">
            <NuxtLink :href="`/dashboard/pipeline/opportunities/${row.id}`" class="text-brand hover:underline">
                {{ row.topic }}
            </NuxtLink>
        </template>

        <template #companyName-data="{ row }">
            <NuxtLink
                v-if="row.company"
                :href="`/dashboard/customer/companies/${row.company.id}`"
                class="text-brand hover:underline"
            >
                {{ row.company?.name }}
            </NuxtLink>
        </template>

        <template #estBudget-data="{ row }">
            {{ row.est_budget ? formatToRupiah(row.est_budget) : '' }}
        </template>

        <template #estRevenue-data="{ row }">
            {{ row.est_revenue ? formatToRupiah(row.est_revenue) : '' }}
        </template>

        <template #actBudget-data="{ row }">
            {{ row.act_budget ? formatToRupiah(row.act_budget) : '' }}
        </template>

        <template #actRevenue-data="{ row }">
            {{ row.act_revenue ? formatToRupiah(row.act_revenue) : '' }}
        </template>

        <template #actCloseDate-data="{ row }">
            {{ useDateFormat(row.act_close_date, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>

        <template #contactName-data="{ row }">
            <NuxtLink
                v-if="row.contact"
                :href="`/dashboard/customer/contacts/${row.contact.id}`"
                class="text-brand hover:underline"
            >
                {{ getUserFullName(row.contact) }}
            </NuxtLink>
        </template>

        <template #rating-data="{ row }">
            {{ row.rating?.name }}
        </template>

        <template #status-data="{ row }">
            {{ row.status?.name }}
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>
        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No opportunities found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter v-model:page="page" v-model:pageSize="pageCount" :totalRows />
</template>

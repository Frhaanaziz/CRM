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
            th: { base: 'text-nowrap' },
        }"
        @select="(v: Pick<Opportunity, 'id'>) => emit('select', v)"
    >
        <template #lead(company(name))-data="{ row }">
            <NuxtLink
                v-if="row.lead?.company"
                :href="`/dashboard/pipeline/leads/${row.lead?.id}`"
                class="text-brand hover:underline"
            >
                {{ row.lead?.company?.name }}
            </NuxtLink>
        </template>

        <template #contact(first_name)-data="{ row }">
            <NuxtLink
                v-if="row.contact"
                :href="`/dashboard/customer/contacts/${row.contact.id}`"
                class="text-brand hover:underline"
            >
                {{ getUserFullName(row.contact) }}
            </NuxtLink>
        </template>

        <template #status(name)-data="{ row }">
            {{ row.status?.name }}
        </template>

        <template #user(first_name)-data="{ row }">
            {{ getUserFullName(row.user) }}
        </template>

        <template #est_budget-data="{ row }">
            {{ row.est_budget ? formatToRupiah(row.est_budget) : '' }}
        </template>

        <template #est_revenue-data="{ row }">
            {{ row.est_revenue ? formatToRupiah(row.est_revenue) : '' }}
        </template>

        <template #act_budget-data="{ row }">
            {{ row.act_budget ? formatToRupiah(row.act_budget) : '' }}
        </template>

        <template #act_revenue-data="{ row }">
            {{ row.act_revenue ? formatToRupiah(row.act_revenue) : '' }}
        </template>

        <template #act_close_date-data="{ row }">
            {{ row.act_close_date && useDateFormat(row.act_close_date, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>

        <template #rating(name)-data="{ row }">
            {{ row.rating?.name }}
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}
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

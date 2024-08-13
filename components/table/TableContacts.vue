<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddContact from '~/components/modal/ModalAddContact.vue';

const modal = useModal();

const { columns, selectedColumns, tableColumns, selectedRows, selectRow, search, debouncedSearch, page, pageSize, sort } =
    useDataTable({
        columns: [
            {
                key: 'first_name',
                label: 'Full Name',
                sortable: true,
            },
            {
                key: 'email',
                label: 'Email',
                sortable: true,
            },
            {
                key: 'company(name)',
                label: 'Company Name',
                sortable: true,
            },
            {
                key: 'main_phone',
                label: 'Main Phone',
                sortable: true,
            },
            {
                key: 'mobile_phone',
                label: 'Mobile Phone',
                sortable: true,
            },
            {
                key: 'created_at',
                label: 'Created on',
                sortable: true,
            },
            {
                key: 'is_valid_email',
                label: 'Valid Email',
                sortable: true,
            },
        ],
        initialColumnKeys: ['first_name', 'email', 'company(name)', 'mobile_phone'],
    });

const { data: contactsPaginated, status } = await useLazyFetch('/api/contacts', {
    query: {
        query: debouncedSearch,
        page: page,
        limit: pageSize,
        sort: computed(() => sort.value.column),
        order: computed(() => sort.value.direction),
    },
    headers: useRequestHeaders(['cookie']),
});

async function handleDeleteContacts() {
    try {
        await Promise.all(selectedRows.value.map((company) => $fetch(`/api/contacts/${company.id}`, { method: 'DELETE' })));

        toast.success('Contact has been deleted successfully.');
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to delete contact:', e);
        toast.error('Failed to delete contact, please try again later.');
    }
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="flex items-center justify-between gap-x-3 p-4">
        <h1 class="text-2xl font-semibold">My Active Contacts</h1>

        <div class="hidden sm:flex sm:items-center sm:gap-1.5">
            <UButton
                v-if="!!selectedRows.length"
                icon="i-heroicons-trash"
                color="black"
                size="xs"
                variant="ghost"
                @click="
                    modal.open(LazyModalDelete, {
                        onClose: () => modal.close(),
                        title: 'Contact',
                        description:
                            'Deleting contact will delete all records under the contact as well (for example opportunities, tasks, and activities).',
                        onConfirm: handleDeleteContacts,
                    })
                "
            >
                Delete
            </UButton>

            <UButton
                icon="i-heroicons-plus"
                color="black"
                size="xs"
                variant="ghost"
                @click="
                    modal.open(LazyModalAddContact, {
                        onClose: () => modal.close(),
                    })
                "
            >
                New
            </UButton>

            <!-- Columns Selector -->
            <USelectMenu v-model="selectedColumns" :options="columns" multiple :uiMenu="{ width: 'min-w-32' }">
                <UButton icon="i-heroicons-view-columns" color="black" size="xs" variant="ghost"> Columns </UButton>
            </USelectMenu>

            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        by="id"
        :loading="status === 'pending'"
        :rows="contactsPaginated?.result ?? []"
        :columns="tableColumns"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
            th: {
                color: 'text-weak',
                font: 'font-normal',
            },
        }"
        @select="selectRow"
    >
        <template #first_name-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/contacts/${row.id}`" class="text-brand hover:underline">
                {{ getUserFullName(row) }}
            </NuxtLink>
        </template>

        <template #company(name)-data="{ row }">
            {{ row.company?.name }}
        </template>

        <template #is_valid_email-data="{ row }">
            <UBadge variant="outline" :color="row.is_valid_email ? 'green' : 'red'">
                {{ row.is_valid_email ? 'Yes' : 'No' }}
            </UBadge>
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No contacts found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter
        v-if="contactsPaginated"
        v-model:page="page"
        v-model:pageSize="pageSize"
        :totalRows="contactsPaginated.total_row"
    />
</template>

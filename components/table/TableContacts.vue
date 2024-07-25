<script lang="ts" setup>
import { refDebounced, useDateFormat } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddContact from '~/components/modal/ModalAddContact.vue';
import type { Contact } from '~/types';

const modal = useModal();

const { columns, selectedColumns, tableColumns, selectedRows, selectRow, search, debouncedSearch, page, pageCount, sort } =
    useTable();

const { data: contactsPaginated, status } = await useLazyFetch('/api/contacts', {
    query: {
        query: debouncedSearch,
        page: page,
        limit: pageCount,
        sort: computed(() => sort.value.column),
        order: computed(() => sort.value.direction),
    },
    transform: (data) => ({
        ...data,
        result: data.result.map((contact) => ({
            id: contact.id,
            fullName: getUserFullName(contact),
            email: contact.email,
            mainPhone: contact.main_phone,
            mobilePhone: contact.mobile_phone,
            company: contact.company,
            created_at: contact.created_at,
            isValidEmail: contact.is_valid_email,
        })),
    }),
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
function useTable() {
    const columns = [
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
            key: 'mainPhone',
            label: 'Main Phone',
            sortable: true,
        },
        {
            key: 'mobilePhone',
            label: 'Mobile Phone',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created on',
            sortable: true,
        },
        {
            key: 'isValidEmail',
            label: 'Valid Email',
            sortable: true,
        },
    ];
    const initialColumnKeys = ['first_name', 'email', 'company(name)', 'mobilePhone'];
    const selectedColumns = ref(columns.filter((column) => initialColumnKeys.includes(column.key)));
    const tableColumns = computed(() =>
        columns.filter((column) => selectedColumns.value.some((selected) => selected.key === column.key))
    );

    // Selected Rows
    const selectedRows = ref<Pick<Contact, 'id'>[]>([]);
    function selectRow(row: Pick<Contact, 'id'>) {
        const index = selectedRows.value.findIndex((item) => item.id === row.id);
        if (index === -1) {
            selectedRows.value.push(row);
        } else {
            selectedRows.value.splice(index, 1);
        }
    }

    const search = ref('');
    const debouncedSearch = refDebounced(
        computed(() => search.value.trim()),
        300
    );
    const page = ref(1);
    const pageCount = ref(10);
    const sort = ref({ column: 'created_at', direction: 'desc' as const });

    // Reset page when search changes
    watch(debouncedSearch, () => {
        page.value = 1;
    });

    return {
        search,
        debouncedSearch,
        page,
        pageCount,
        sort,
        selectedColumns,
        tableColumns,
        columns,
        selectedRows,
        selectRow,
    };
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
                {{ row.fullName }}
            </NuxtLink>
        </template>

        <template #company(name)-data="{ row }">
            <NuxtLink :href="`/dashboard/customer/companies/${row.company.id}`" class="text-brand hover:underline">
                {{ row.company.name }}
            </NuxtLink>
        </template>

        <template #isValidEmail-data="{ row }">
            <UBadge variant="outline" :color="row.is_valid_email ? 'green' : 'red'">
                {{ row.is_valid_email ? 'Yes' : 'No' }}
            </UBadge>
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
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
        v-model:pageCount="pageCount"
        :totalRows="contactsPaginated.total_row"
    />
</template>

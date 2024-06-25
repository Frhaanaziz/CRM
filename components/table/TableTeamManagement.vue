<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { User } from '~/types';
import LazyModalInviteUser from '~/components/modal/ModalInviteUser.vue';
import LazyModalUpdateUserOrganization from '~/components/modal/ModalUpdateUserOrganization.vue';

// Columns
const initialColumns = [
    {
        key: 'user',
        label: 'User',
        sortable: true,
    },
    {
        key: 'phone',
        label: 'Phone',
        sortable: true,
    },
    {
        key: 'role',
        label: 'Role',
        sortable: true,
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
    },
    {
        key: 'actions',
        label: 'Actions',
        sortable: false,
    },
];
const columns = [
    ...initialColumns,
    {
        key: 'linkedin',
        label: 'LinkedIn',
        sortable: true,
    },
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
    },
    {
        key: 'updated_at',
        label: 'Updated At',
        sortable: true,
    },
];

const selectedColumns = ref(initialColumns);
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)));

const user = useSupabaseUser();
if (!user.value) throw new Error('User is not authenticated');

const { data: users, status } = await useLazyFetch(`/api/organizations/${user.value?.app_metadata?.organization_id}/users`, {
    transform: (users) =>
        users.map((user) => ({
            ...user,
            role: user.role?.name,
        })),
    default: () => [],
});
const pending = computed(() => status.value === 'pending');

const { filteredData: filteredUsers, search, page, pageCount, sort, pageTotal } = useFilterAndPaginate(users);
const filteredUsersCustom = computed(() =>
    filteredUsers.value.map((user) => ({
        ...user,
        role: { value: user.role, id: user.role_id, class: 'w-[120px] max-w-[120px]' },
        status: { value: user.status, class: 'w-40 max-w-40' },
        actions: { value: undefined, class: 'w-28 max-w-28' },
    }))
);

const modal = useModal();
function openInviteUserModal() {
    modal.open(LazyModalInviteUser, {
        onClose: () => modal.close(),
    });
}
function openUpdateUserModal(user: { id: User['id']; role_id: User['role_id']; status: User['status'] }) {
    modal.open(LazyModalUpdateUserOrganization, {
        onClose: () => modal.close(),
        user,
    });
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="flex items-center justify-between gap-y-3 pb-2">
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Members</h2>
        </div>

        <div class="flex items-center gap-2">
            <UButton icon="i-heroicons-plus" @click="openInviteUserModal"> Invite </UButton>
            <UInput
                v-model="search"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Search user"
                class="hidden sm:block"
            />

            <!-- Columns Selector -->
            <USelectMenu
                v-model="selectedColumns"
                :options="columns"
                multiple
                :uiMenu="{ width: 'min-w-32' }"
                class="hidden sm:block"
            >
                <UButton icon="i-heroicons-view-columns" color="gray" size="xs"> Columns </UButton>
            </USelectMenu>
        </div>
    </div>

    <!-- Table -->
    <UTable
        v-model:sort="sort"
        :rows="filteredUsersCustom"
        :columns="columnsTable"
        :loading="pending"
        sort-mode="manual"
        class="w-full"
        :ui="{
            tr: { base: '[&>td]:hover:bg-base-200' },
            td: { base: 'max-w-[0] truncate text-default' },
        }"
    >
        <template #user-data="{ row }">
            <div class="flex items-center gap-4">
                <UAvatar :src="row?.photo ?? '/images/avatar-fallback.jpg'" size="lg" />
                <div class="flex flex-col justify-center">
                    <p class="font-semibold">{{ `${row?.first_name} ${row?.last_name}` }}</p>
                    <p class="text-xs">{{ row?.email }}</p>
                </div>
            </div>
        </template>

        <template #status-data="{ row }">
            <UBadge v-if="row.status.value === 'active'" variant="outline" color="green" :ui="{ rounded: 'rounded-full' }"
                >Active</UBadge
            >
            <UBadge v-else variant="outline" color="red" :ui="{ rounded: 'rounded-full' }">Inactive</UBadge>
        </template>

        <template #role-data="{ row }">
            {{ capitalize(row.role.value) }}
        </template>

        <template #linkedin-data="{ row }">
            <NuxtLink :href="row.linkedin" class="text-brand hover:underline" external target="_blank">
                {{ row.linkedin }}
            </NuxtLink>
        </template>

        <template #created_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>
        <template #updated_at-data="{ row }">
            {{ useDateFormat(row.created_at, 'YYYY-MM-DD HH:mm:ss').value.replace('"', '') }}
        </template>

        <template #actions-data="{ row }">
            <div class="flex justify-center">
                <UButton
                    icon="i-heroicons-pencil-square"
                    size="sm"
                    square
                    variant="ghost"
                    color="gray"
                    :disabled="user?.id === row.id"
                    @click="openUpdateUserModal({ id: row.id, role_id: row.role.id, status: row.status.value })"
                />
            </div>
        </template>

        <template #empty-state>
            <div class="flex flex-col items-center justify-center gap-y-5 py-10">
                <NuxtImg src="/icons/magnifying-glass-x.svg" alt="" width="64" height="64" />
                <p>No members found</p>
            </div>
        </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <TableFooter v-model:page="page" v-model:pageCount="pageCount" :pageTotal="pageTotal" />
</template>

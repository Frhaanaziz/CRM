<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { User, Role } from '~/types';
import LazyModalInviteUser from '~/components/modal/ModalInviteUser.vue';
import LazyModalUpdateUserOrganization from '~/components/modal/ModalUpdateUserOrganization.vue';

interface IDataUser extends User {
    role: Pick<Role, 'name'>;
}

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
        label: '',
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

const { data: users, status } = await useLazyAsyncData(
    async () => {
        const users = await $fetch<IDataUser[]>(`/api/organizations/${user.value?.app_metadata?.organization_id}/users`);
        return users.map((user) => ({
            ...user,
            role: user.role.name,
            // create random true or false
            status: Math.random() < 0.5 ? 'Active' : 'Inactive',
        }));
    },
    {
        default: () => [],
    },
);
const pending = computed(() => status.value === 'pending');

const { filteredData: filteredUsers, search, page, pageCount, sort, pageTotal, pageFrom, pageTo } = useFilterAndPaginate(users);
const filteredUsersCustom = computed(() =>
    filteredUsers.value.map((user) => ({
        ...user,
        role: { value: user.role, class: 'w-44 max-w-44' },
        status: { value: user.status, class: 'w-40 max-w-40' },
        actions: { value: undefined, class: 'w-28 max-w-28' },
    })),
);

const modal = useModal();
function openInviteUserModal() {
    modal.open(LazyModalInviteUser, {
        onClose: () => modal.close(),
    });
}
function openUpdateUserModal(user: { id: User['id']; role: Role['name'] }) {
    modal.open(LazyModalUpdateUserOrganization, {
        onClose: () => modal.close(),
        user,
    });
}
</script>

<template>
    <!-- Header and Action buttons -->
    <div class="w- w- w- w- w- flex items-center justify-between gap-y-3 pb-2">
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
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
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
            <UBadge v-if="row.status.value === 'Active'" variant="outline" color="green" :ui="{ rounded: 'rounded-full' }"
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
                    @click="() => openUpdateUserModal({ id: row.id, role: row.role.value })"
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
    <div class="mt-5 flex flex-wrap items-center justify-between">
        <div>
            <span class="text-sm leading-5">
                Showing
                <span class="font-medium">{{ pageFrom }}</span>
                to
                <span class="font-medium">{{ pageTo }}</span>
                of
                <span class="font-medium">{{ pageTotal }}</span>
                results
            </span>
        </div>

        <div class="hidden md:flex md:items-center md:gap-1.5">
            <span class="text-sm leading-5">Rows per page:</span>

            <USelect v-model="pageCount" :options="['3', '5', '10', '20', '30', '40']" class="me-2 w-20" size="xs" />
        </div>

        <UPagination
            v-model="page"
            :page-count="parseInt(pageCount)"
            :total="pageTotal"
            :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: '!rounded-full min-w-[32px] justify-center',
                default: {
                    activeButton: {
                        variant: 'outline',
                    },
                },
            }"
        />
    </div>
</template>

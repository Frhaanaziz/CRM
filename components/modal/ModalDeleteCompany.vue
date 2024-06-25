<script setup lang="ts">
import type { Company } from '~/types';

const props = defineProps<{ companies: Pick<Company, 'id'>[] }>();
const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const isDeleting = ref(false);
async function handleAction() {
    try {
        isDeleting.value = true;

        await Promise.all(props.companies.map(async (company) => $fetch(`/api/companies/${company.id}`, { method: 'DELETE' })));

        toast.success('Company has been deleted successfully.');
        await refreshNuxtData('companies');
        closeModal();
    } catch (e) {
        console.error('Failed to delete company:', getErrorMessage(e));
        toast.error('Failed to delete company, please try again later.');
    } finally {
        isDeleting.value = false;
    }
}
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-sm',
        }"
    >
        <div class="space-y-5 p-4">
            <div class="flex items-center justify-between">
                <div class="flex shrink-0 items-center gap-2">
                    <NuxtImg src="/icons/exclamation-circle-red.svg" alt="" width="32" height="32" />
                    <p class="font-semibold">Delete Company</p>
                </div>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
            </div>

            <p class="text-weak">
                Deleting company will delete all records under the company as well (for example opportunities, tasks, and
                activities). Are you sure to delete this Company? You can’t undo this action.
            </p>

            <div class="flex items-center justify-end gap-x-2">
                <UButton color="red" variant="outline" :disable="isDeleting" @click="closeModal"> Cancel </UButton>

                <UButton color="red" :disable="isDeleting" :loading="isDeleting" @click="handleAction"> Delete </UButton>
            </div>
        </div>
    </UModal>
</template>

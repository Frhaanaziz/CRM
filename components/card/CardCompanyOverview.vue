<script lang="ts" setup>
import type { CompanyOverview } from '~/types';
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const props = defineProps<{
    overview: CompanyOverview;
}>();

const isEditingMode = ref(false);
const isUpdating = ref(false);

const { state, updateCompanyOverview } = useUpdateCompanyOverview();

const items = [
    [
        {
            label: 'Edit',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => (isEditingMode.value = true),
        },
        {
            label: 'Delete',
            icon: 'i-heroicons-trash-20-solid',
            click: deleteOverview,
        },
    ],
];

async function deleteOverview() {
    try {
        isUpdating.value = true;

        await $fetch(`/api/companies/${props.overview.company_id}/overview/${props.overview.id}`, {
            method: 'DELETE',
        });

        await refreshNuxtData();
    } catch (error) {
        console.error('Error deleting overview', error);
        toast.error('Failed to delete overview, please try again later.');
    } finally {
        isUpdating.value = false;
    }
}
function useUpdateCompanyOverview() {
    type UpdateCompanyOverviewType = z.infer<typeof updateCompanyOverviewSchema>;
    const state = ref(props.overview);

    async function updateCompanyOverview(event: FormSubmitEvent<UpdateCompanyOverviewType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/companies/${props.overview.company_id}/overview/${props.overview.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            isEditingMode.value = false;
            await refreshNuxtData();
        } catch (error) {
            console.error('Error updating overview', error);
            toast.error('Failed to update overview, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { state, updateCompanyOverview };
}
</script>

<template>
    <li>
        <div v-if="isEditingMode" class="bg-brand-50 p-2">
            <LazyUForm
                :schema="updateCompanyOverviewSchema"
                :state="state"
                class="space-y-3"
                @submit="updateCompanyOverview"
                @error="console.error"
            >
                <UFormGroup label="Title" name="title" required>
                    <UInput v-model="state.title" placeholder="Enter title" :disabled="isUpdating" />
                </UFormGroup>

                <UFormGroup name="description" required>
                    <UTextarea
                        v-model="state.description"
                        autoresize
                        :maxrows="10"
                        placeholder="Add text here..."
                        :disabled="isUpdating"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isUpdating" @click="isEditingMode = false">
                        Cancel
                    </UButton>
                    <UButton type="submit" :disabled="isUpdating" :loading="isUpdating">Save</UButton>
                </div>
            </LazyUForm>
        </div>

        <div v-else class="border-l-4 border-l-brand p-2 text-sm text-gray-700">
            <div class="flex items-center justify-between">
                <p class="font-semibold">{{ overview.title }}</p>

                <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
                    <UButton
                        :padded="false"
                        icon="i-heroicons-ellipsis-vertical"
                        square
                        variant="ghost"
                        color="black"
                        :disabled="isUpdating"
                    />
                </UDropdown>
            </div>
            <p>{{ overview.description }}</p>
        </div>
    </li>
</template>

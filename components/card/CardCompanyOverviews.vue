<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';
import type { CompanyOverview } from '~/types';

const props = defineProps<{
    company_id: number;
    overviews: CompanyOverview[];
}>();

const isCreating = ref(false);

const initialState: AddCompanyOverviewType = {
    title: '',
    description: '',
};
const state = ref({ ...initialState });
const isSubmitting = ref(false);

type AddCompanyOverviewType = z.infer<typeof addCompanyOverviewSchema>;
async function handleSubmit(event: FormSubmitEvent<AddCompanyOverviewType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/companies/${props.company_id}/overview`, {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        await refreshNuxtData();
        state.value = { ...initialState };
        isCreating.value = false;
    } catch (e) {
        console.error('Failed to add company overview', e);
        toast.error('Failed to company overview, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-slate-700">
                    Overview <span v-if="!!overviews.length">({{ overviews.length }})</span>
                </h2>
                <UButton variant="ghost" square color="black" :padded="false" @click="isCreating = !isCreating">
                    <UIcon name="i-heroicons-plus" class="h-6 w-6" />
                </UButton>
            </div>
        </template>

        <div v-if="isCreating" class="bg-brand-50 p-4">
            <LazyUForm
                :schema="addCompanyOverviewSchema"
                :state="state"
                class="space-y-3"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Title" name="title" required>
                    <UInput v-model="state.title" placeholder="Enter title" :disabled="isSubmitting" />
                </UFormGroup>

                <UFormGroup name="description" required>
                    <UTextarea
                        v-model="state.description"
                        autoresize
                        :maxrows="10"
                        placeholder="Add text here..."
                        :disabled="isSubmitting"
                    />
                </UFormGroup>

                <div class="grid grid-cols-2 gap-2">
                    <UButton
                        type="button"
                        variant="ghost"
                        color="black"
                        :disabled="isSubmitting"
                        block
                        @click="isCreating = false"
                    >
                        Cancel
                    </UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting" block>Save</UButton>
                </div>
            </LazyUForm>
        </div>

        <ul v-if="!!overviews?.length" class="divide-y">
            <LazyCardCompanyOverview v-for="overview in overviews" :key="overview.id" :overview />
        </ul>

        <UButton
            v-if="!(isCreating || overviews?.length > 0)"
            variant="ghost"
            color="black"
            block
            class="justify-start text-slate-700"
            @click="isCreating = true"
        >
            Add New Overview
        </UButton>
    </UCard>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

type AddCompanyType = z.infer<typeof addCompanySchema>;
const isSubmitting = ref(false);
const state = ref({
    name: '',
    website: undefined,
});
async function handleSubmit(event: FormSubmitEvent<AddCompanyType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/companies', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        closeModal();
        toast.success('Company added successfully.');
        await refreshNuxtData('companies');
    } catch (e) {
        console.error('Failed to add company', e);
        toast.error('Failed to add company, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-sm',
        }"
    >
        <div class="flex items-center justify-between p-3">
            <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Add New Company</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>

        <div class="space-y-3 bg-base-200 p-3">
            <p class="font-semibold text-brand">Details</p>

            <UForm :schema="addCompanySchema" :state="state" class="space-y-3" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="Company Name" name="name" required>
                    <UInput
                        v-model="state.name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter company name"
                    />
                </UFormGroup>

                <UFormGroup label="Website" name="website" required>
                    <UInput
                        v-model="state.website"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter company website"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
                </div>
            </UForm>
        </div>
    </UModal>
</template>

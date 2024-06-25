<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Company } from '~/types';

const props = defineProps<{
    company: Pick<Company, 'id' | 'name'>;
}>();
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

type AddContactType = z.infer<typeof addContactSchema>;
const isSubmitting = ref(false);
const state = ref<AddContactType>({
    first_name: '',
    last_name: '',
    email: '',
    job_title: null,
    company_id: props.company.id,
});
async function handleSubmit(event: FormSubmitEvent<AddContactType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/contacts', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData([`company-${props.company.id}`, `company-${props.company.id}-contacts`]);
        toast.success('Contact added successfully.');
    } catch (e) {
        console.error('Failed to add contact', e);
        toast.error('Failed to add contact, please try again later.');
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
            <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Add New Contact</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>

        <div class="space-y-3 bg-base-200 p-3">
            <UForm :schema="addContactSchema" :state="state" class="space-y-3" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="First Name" name="first_name" required>
                    <UInput
                        v-model="state.first_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter first name"
                    />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name" required>
                    <UInput
                        v-model="state.last_name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter last name"
                    />
                </UFormGroup>

                <UFormGroup label="Email" name="email" required>
                    <UInput v-model="state.email" :disabled="isSubmitting" :loading="isSubmitting" placeholder="Enter email" />
                </UFormGroup>

                <UFormGroup label="Job Title" name="job_title">
                    <UInput
                        v-model="state.job_title"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter job title"
                    />
                </UFormGroup>

                <UFormGroup label="Company">
                    <UInput :value="props.company.name" disabled />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
                </div>
            </UForm>
        </div>
    </UModal>
</template>

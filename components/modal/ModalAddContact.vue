<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const user = useSupabaseUser();
if (!user.value || !user.value.user_metadata.organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const { data: companiesOption } = await useLazyFetch(`/api/organizations/${user.value.user_metadata.organization_id}/companies`, {
    transform: (companies) =>
        companies.map((company) => ({
            value: company.id,
            label: company.name,
        })),
    default: () => [],
});

type AddContactType = z.infer<typeof addContactSchema>;
const isSubmitting = ref(false);
const state = ref({
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    organization_id: user.value.user_metadata.organization_id,
    company_id: undefined,
    user_id: user.value.id,
});
async function handleSubmit(event: FormSubmitEvent<AddContactType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/contacts', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        closeModal();
        toast.success('Contact added successfully.');
        await refreshNuxtData('contacts');
    } catch (e) {
        console.error('Failed to add contact', e);
        toast.error('Failed to add contact, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Add New Contact" @close="closeModal">
        <UForm :schema="addContactSchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
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

            <UFormGroup label="Company" name="company_id">
                <USelectMenu
                    v-model="state.company_id"
                    value-attribute="value"
                    option-attribute="label"
                    :options="companiesOption"
                    searchable
                    searchable-placeholder="Search a companies..."
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                    placeholder="Select company"
                />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

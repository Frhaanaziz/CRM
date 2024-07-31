<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { user } = storeToRefs(userSessionStore());
if (!user.value || !user.value.user_metadata.organization_id) throw createError({ status: 401, message: 'Unauthorized' });

const { data: companiesOption } = await useLazyFetch(`/api/organizations/${user.value.user_metadata.organization_id}/companies`, {
    key: `organizations-${user.value.user_metadata.organization_id}-companies`,
    transform: (companies) =>
        companies.map((company) => ({
            value: company.id,
            label: company.name,
        })),
    default: () => [],
});

type AddOpportunityType = z.infer<typeof addOpportunitySchema>;
const isSubmitting = ref(false);
const state = ref({
    topic: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: undefined,
    company_id: undefined,
});
async function handleSubmit(event: FormSubmitEvent<AddOpportunityType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/opportunities', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        closeModal();
        toast.success('Opportunity added successfully.');
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to add opportunity', e);
        toast.error('Failed to add opportunity, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Add New Opportunity" @close="closeModal">
        <UForm :schema="addOpportunitySchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
            <UFormGroup label="Topic" name="topic" required>
                <UInput v-model="state.topic" :disabled="isSubmitting" :loading="isSubmitting" placeholder="Enter topic" />
            </UFormGroup>

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

            <UFormGroup label="Business Phone" name="phone">
                <UInput
                    v-model="state.phone"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter business phone"
                />
            </UFormGroup>

            <UFormGroup label="Company Name" name="company_id" required>
                <USelectMenu
                    v-model="state.company_id"
                    value-attribute="value"
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

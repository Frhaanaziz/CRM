<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

type AddOpportunityType = z.infer<typeof addOpportunitySchema>;
const isSubmitting = ref(false);
const state = ref({
    company_name: '',
    email: undefined,
    first_name: '',
    last_name: undefined,
    mobile_phone: undefined,
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
            <UFormGroup label="Company Name" name="company_name" required>
                <UInput
                    v-model="state.company_name"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter First Name"
                />
            </UFormGroup>

            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" :loading="isSubmitting" placeholder="Enter Email" />
            </UFormGroup>

            <UFormGroup label="First Name" name="first_name">
                <UInput
                    v-model="state.first_name"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter First Name"
                />
            </UFormGroup>

            <UFormGroup label="Last Name" name="last_name">
                <UInput
                    v-model="state.last_name"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter Last Name"
                />
            </UFormGroup>

            <UFormGroup label="Mobile Phone" name="mobile_phone">
                <UInput
                    v-model="state.mobile_phone"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter Mobile Phone"
                />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

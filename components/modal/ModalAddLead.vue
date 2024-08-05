<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { state, isSubmitting, handleSubmit } = useAddLead();

function useAddLead() {
    type AddLeadType = z.infer<typeof addLeadSchema>;
    const isSubmitting = ref(false);
    const state = ref({
        company_name: '',
        email: undefined,
        mobile_phone: undefined,
    });

    async function handleSubmit(event: FormSubmitEvent<AddLeadType>) {
        isSubmitting.value = true;
        try {
            await $fetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            closeModal();
            toast.success('Lead added successfully.');
            await refreshNuxtData();
        } catch (e) {
            console.error('Failed to add lead', e);
            toast.error('Failed to add lead, please try again later.');
        }
        isSubmitting.value = false;
    }

    return { state, isSubmitting, handleSubmit };
}
</script>

<template>
    <ModalCommon title="Add New Lead" :ui="{ width: 'sm:max-w-sm' }" @close="closeModal">
        <UForm :schema="addLeadSchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
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

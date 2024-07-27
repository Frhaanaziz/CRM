<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { B2BContact } from '~/types';

const props = defineProps<{ company_id: B2BContact['company_id'] }>();

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { user } = storeToRefs(userSessionStore());
if (!user.value || !user.value.user_metadata.organization_id) throw createError({ status: 401, message: 'Unauthorized' });

type AddB2BContactType = z.infer<typeof addB2BContactSchema>;
const isSubmitting = ref(false);
const state = ref({
    organization_id: user.value.user_metadata.organization_id,
    user_id: user.value.id,
    company_id: props.company_id,
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    mobile_phone: '',
});

async function handleSubmit(event: FormSubmitEvent<AddB2BContactType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/b2b-contacts', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        closeModal();
        toast.success('Contact added successfully.');
        await refreshNuxtData(`b2b-companies-${props.company_id}`);
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
        <UForm :schema="addB2BContactSchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
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

            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" :loading="isSubmitting" placeholder="Enter email" />
            </UFormGroup>

            <UFormGroup label="Job Title" name="job_title" required>
                <UInput
                    v-model="state.job_title"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter job title"
                />
            </UFormGroup>

            <UFormGroup label="Mobile Phone" name="mobile_phone">
                <UInput
                    v-model="state.mobile_phone"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter mobile phone number"
                />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

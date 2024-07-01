<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

const user = useSupabaseUser();
if (!user.value || !user.value.user_metadata.organization_id) throw createError({ status: 401, message: 'Unauthorized' });

type AddCompanyType = z.infer<typeof addCompanySchema>;
const isSubmitting = ref(false);
const state = ref({
    name: '',
    website: undefined,
    user_id: user.value.id,
    organization_id: user.value.user_metadata.organization_id,
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
    <ModalCommon title="Add New Company" @close="closeModal">
        <UForm :schema="addCompanySchema" :state="state" class="space-y-4" @submit="handleSubmit" @error="console.error">
            <UFormGroup label="Company Name" name="name" required>
                <UInput v-model="state.name" :disabled="isSubmitting" :loading="isSubmitting" placeholder="Enter company name" />
            </UFormGroup>

            <UFormGroup label="Website" name="website" required>
                <UInput
                    v-model="state.website"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    placeholder="Enter company website"
                />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2 pt-4">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

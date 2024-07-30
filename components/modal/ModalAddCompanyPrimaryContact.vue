<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Company } from '~/types';

const props = defineProps<{
    company: Pick<Company, 'id'>;
}>();

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { data: contactsOption } = await useLazyFetch(`/api/companies/${props.company.id}/contacts`, {
    key: `companies-${props.company.id}-contacts`,
    transform: (contacts) =>
        contacts.map((contact) => ({
            value: contact.id,
            label: getUserFullName(contact),
        })),
    default: () => [],
});

type AddCompanyPrimaryContactType = z.infer<typeof addCompanyPrimaryContactSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.company.id,
    primary_contact_id: undefined,
});
async function handleSubmit(event: FormSubmitEvent<AddCompanyPrimaryContactType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/companies/${props.company.id}`, {
            method: 'PUT',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData(`companies-${props.company.id}`);
        toast.success('Primary contact added successfully');
    } catch (e) {
        console.error('Error adding primary contact:', e);
        toast.error('Failed to add primary contact, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Add Primary Contact" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">You will add the primary contact of this company.</p>

            <UForm
                :schema="addCompanyPrimaryContactSchema"
                :state="state"
                class="space-y-8"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Choose Contact" name="primary_contact_id" required>
                    <USelectMenu
                        v-model="state.primary_contact_id"
                        value-attribute="value"
                        option-attribute="label"
                        :options="contactsOption"
                        searchable
                        searchable-placeholder="Search a contacts..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                        placeholder="Select contact"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
                </div>
            </UForm>
        </div>
    </ModalCommon>
</template>

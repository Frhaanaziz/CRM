<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Company, Contact } from '~/types';

const props = defineProps<{
    company: Pick<Company, 'id'>;
    primaryContact: Pick<Contact, 'id'>;
}>();
const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const { data: contacts } = await useLazyFetch(`/api/companies/${props.company.id}/contacts`, {
    key: `company-${props.company.id}-contacts`,
});
const contactsOption = computed(() => {
    return (
        contacts.value?.map((contact) => ({
            value: contact.id,
            label: `${contact.first_name} ${contact.last_name}`,
        })) ?? []
    );
});

type AddCompanyPrimaryContactType = z.infer<typeof addCompanyPrimaryContactSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.company.id,
    primary_contact_id: props.primaryContact.id,
});
async function handleSubmit(event: FormSubmitEvent<AddCompanyPrimaryContactType>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/companies/${props.company.id}/primary-contact-id`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData(`company-${props.company.id}`);
    } catch (e) {
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Edit Primary Contact" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">You will change the primary contact of this company.</p>

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

<script setup lang="ts">
import type { B2BCompany } from '~/types';

const props = defineProps<{
    b2b_company_id: B2BCompany['id'];
}>();

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const isLoading = ref(false);

async function addToCRM() {
    try {
        isLoading.value = true;

        await $fetch('/api/crm/add-to-lead', {
            method: 'POST',
            body: JSON.stringify(props),
        });

        toast.success('Company added to CRM successfully.');
        closeModal();
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to add company to CRM', e);
        toast.error('Failed to add company to CRM, please try again later.');
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Add Company to CRM" @close="closeModal">
        <div class="space-y-6">
            <p class="text-weak">You will be redirected to out CRM web app.</p>

            <div class="flex items-center justify-end gap-2">
                <UButton variant="outline" :disabled="isLoading" @click="closeModal">Cancel</UButton>
                <UButton :loading="isLoading" :disabled="isLoading" @click="addToCRM">Add to CRM</UButton>
            </div>
        </div>
    </ModalCommon>
</template>

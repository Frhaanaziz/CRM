<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Lead } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    lead: Pick<Lead, 'id' | 'topic'>;
}>();

type UpdateLeadTopic = z.infer<typeof updateLeadTopicSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.lead.id,
    topic: props.lead.topic ?? undefined,
});
async function handleSubmit(event: FormSubmitEvent<UpdateLeadTopic>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/leads/${props.lead.id}/topic`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData(`lead-${props.lead.id}`);
    } catch (e) {
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Fill in the Topic" @close="closeModal">
        <div class="space-y-4">
            <p class="text-weak">The topic of this lead is empty. Please fill in the topic before qualifying the lead.</p>

            <UForm :schema="updateLeadTopicSchema" :state="state" class="space-y-8" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="Topic" name="topic">
                    <UTextarea
                        v-model="state.topic"
                        name="topic"
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                        placeholder="Enter the topic of this lead"
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

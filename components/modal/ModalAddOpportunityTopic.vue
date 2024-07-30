<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Opportunity } from '~/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    opportunity: Pick<Opportunity, 'id' | 'topic'>;
}>();

type UpdateOpportunityTopic = z.infer<typeof updateOpportunityTopicSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.opportunity.id,
    topic: props.opportunity.topic ?? undefined,
});
async function handleSubmit(event: FormSubmitEvent<UpdateOpportunityTopic>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/opportunities/${props.opportunity.id}`, {
            method: 'PUT',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData(`opportunities-${props.opportunity.id}`);
    } catch (e) {
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <ModalCommon title="Fill in the Topic" @close="closeModal">
        <UForm
            :schema="updateOpportunityTopicSchema"
            :state="state"
            class="space-y-8"
            @submit="handleSubmit"
            @error="console.error"
        >
            <UFormGroup label="Topic" name="topic">
                <UTextarea
                    v-model="state.topic"
                    name="topic"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                    placeholder="Enter the topic of this opportunity"
                />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2">
                <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
            </div>
        </UForm>
    </ModalCommon>
</template>

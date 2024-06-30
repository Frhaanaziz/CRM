<script setup lang="ts">
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}
</script>

<template>
    <ModalCommon title="Add Company to CRM" @close="closeModal">
        <div class="space-y-6">
            <p class="text-weak">You will be redirected to out CRM web app.</p>

            <div class="flex items-center justify-end gap-2">
                <UButton variant="outline" @click="closeModal">Cancel</UButton>
                <UButton>Add to CRM</UButton>
            </div>
        </div>
    </ModalCommon>
</template>

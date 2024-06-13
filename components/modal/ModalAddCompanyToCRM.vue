<script setup lang="ts">
const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-sm',
        }"
    >
        <div class="flex items-center justify-between p-3">
            <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Add Company to CRM</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>

        <div class="space-y-6 bg-base-200 p-3">
            <p>You will be redirected to out CRM web app.</p>

            <div class="flex items-center justify-end gap-2">
                <UButton variant="outline" @click="closeModal">Cancel</UButton>
                <UButton>Add to CRM</UButton>
            </div>
        </div>
    </UModal>
</template>

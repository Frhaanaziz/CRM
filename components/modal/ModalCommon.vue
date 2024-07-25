<script setup lang="ts">
const emit = defineEmits(['close']);
const closeModal = () => emit('close');

defineProps<{
    title: string;
}>();
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-md',
        }"
    >
        <div class="flex items-center justify-between p-4">
            <p class="text-xl font-semibold">{{ title }}</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" square @click="closeModal" />
        </div>

        <div class="bg-base-200 p-4">
            <slot />
        </div>
    </UModal>
</template>

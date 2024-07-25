<script setup lang="ts">
const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const props = defineProps<{
    title?: string;
    description?: string;
    onConfirm: () => Promise<void>;
}>();

const isDeleting = ref(false);

async function deleteItem() {
    isDeleting.value = true;

    await props.onConfirm().then(closeModal);

    isDeleting.value = false;
}
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-sm',
        }"
    >
        <div class="space-y-5 p-4">
            <div class="flex items-center justify-between">
                <div class="flex shrink-0 items-center gap-2">
                    <NuxtImg src="/icons/exclamation-circle-red.svg" alt="" width="32" height="32" />
                    <p class="font-semibold">Delete {{ title }}</p>
                </div>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
            </div>

            <p v-if="description" class="text-weak">{{ description }}</p>
            <p v-else class="text-weak">Are you sure you want to delete this item? This action cannot be undone.</p>

            <div class="flex items-center justify-end gap-x-2">
                <UButton color="red" variant="outline" :disable="isDeleting" @click="closeModal">Cancel</UButton>

                <UButton color="red" :disable="isDeleting" :loading="isDeleting" @click="deleteItem">Delete</UButton>
            </div>
        </div>
    </UModal>
</template>

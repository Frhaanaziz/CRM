<script setup lang="ts">
const emit = defineEmits(['close']);
const closeModal = () => emit('close');
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
                    <p class="font-semibold">Sign Out</p>
                </div>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
            </div>

            <p class="text-weak">You will be return to sign in screen.</p>

            <div class="flex items-center justify-end gap-x-2">
                <UButton color="red" variant="outline" @click="closeModal"> Cancel </UButton>

                <UButton color="red" @click="signOutUser"> Sign Out </UButton>
            </div>
        </div>
    </UModal>
</template>

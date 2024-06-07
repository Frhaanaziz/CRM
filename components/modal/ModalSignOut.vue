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
        <div class="p-4 space-y-5">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 shrink-0">
                    <NuxtImg
                        src="/icons/exclamation-circle-red.svg"
                        alt=""
                        width="32"
                        height="32"
                    />
                    <p class="font-semibold">Sign Out</p>
                </div>
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-x-mark-20-solid"
                    class="-my-1"
                    @click="closeModal"
                />
            </div>

            <p class="text-weak">You will be return to sign in screen.</p>

            <div class="flex justify-end items-center gap-x-2">
                <UButton color="red" variant="outline" @click="closeModal">
                    Cancel
                </UButton>

                <UButton color="red">
                    <NuxtLink href="/api/logout" external> Sign Out </NuxtLink>
                </UButton>
            </div>
        </div>
    </UModal>
</template>

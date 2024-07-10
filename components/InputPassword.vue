<script setup lang="ts">
const type = ref('password');
const switchVisibility = () => (type.value = type.value === 'password' ? 'text' : 'password');
</script>

<template>
    <UInput :ui="{ icon: { trailing: { pointer: '' } } }" :type="type">
        <template #trailing>
            <UButton
                color="gray"
                variant="link"
                :padded="false"
                :icon="type === 'password' ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                @click="switchVisibility"
            />
        </template>
    </UInput>
</template>

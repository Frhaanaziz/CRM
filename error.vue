<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
    error: {
        type: Object as () => NuxtError,
        default: null,
    },
});

if (props.error && props.error.statusCode === 401)
    await navigateTo('/auth/signin');

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
    <div>
        <h2>{{ error?.statusCode }}</h2>
        <button @click="handleError">Clear errors</button>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
    middleware: [
        'auth-logged-in'
    ],
});
</script>

<template>
    <NuxtPage />
</template>
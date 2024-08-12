<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core';

const session = useSupabaseSession();
watch(
    session,
    () => {
        if (session.value) {
            console.log('session value', session.value);
            const sessionStore = userSessionStore();
            sessionStore.session = session.value;
            sessionStore.user = session.value.user;

            // Redirect to protected page
            return navigateTo('/dashboard');
        }
    },
    { immediate: true }
);

useTimeoutFn(() => {
    // toast.error('Failed to login. Please try again.');
    return navigateTo('/auth/signin');
}, 5000);
</script>

<template>
    <div>Waiting for login...</div>
</template>

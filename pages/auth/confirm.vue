<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core';

const session = useSupabaseSession();
watch(
    session,
    () => {
        if (session.value) {
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
    toast.error('Unable to log in automatically. Please enter your credentials to continue.');
    return navigateTo('/auth/signin');
}, 5000);
</script>

<template>
    <!-- <main>Waiting for login...</main> -->
    <main class="min-h-screen">
        <ConfirmBackgroundEffect />
        <section class="flex min-h-screen flex-col items-center justify-center gap-6">
            <h1 class="text-5xl font-semibold text-slate-900">Logging In</h1>
            <p class="text-slate-600">Please wait while we get everything ready for you</p>
            <!-- Waiting for login... -->
        </section>
    </main>
</template>

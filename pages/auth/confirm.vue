<script setup lang="ts">
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

        return navigateTo('/auth/signin');
    },
    { immediate: true }
);
</script>

<template>
    <div>Waiting for login...</div>
</template>

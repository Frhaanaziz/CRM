<script setup lang="ts">
import { userSessionStore } from './stores/userSession';

/**
 * Initializes the userSession store and listens for authentication events.
 *
 * @remarks
 * This code block checks if the current environment is the server environment.
 * If it is, it initializes the userSession store and sets up event listeners for authentication events.
 * When an authentication event occurs (e.g. sign in, sign out, refresh), the session and user information are updated in the userSession store.
 */
if (import.meta.server) {
    const userSession = userSessionStore();

    const supabase = useSupabaseClient();
    supabase.auth.onAuthStateChange((_, session) => {
        userSession.session = session;
        userSession.user = session?.user || null;
    });
}
</script>

<template>
    <NuxtLayout>
        <NuxtRouteAnnouncer />
        <NuxtLoadingIndicator color="#0265DC" />
        <UNotifications />

        <NuxtPage class="text-default" />
        <UModals />
    </NuxtLayout>
</template>

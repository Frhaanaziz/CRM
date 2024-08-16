export default defineNuxtRouteMiddleware((to) => {
    const needcheck = ['/auth/onboarding'];
    if (to.path.startsWith('/auth') && !needcheck.includes(to.path)) return;

    if (import.meta.server) {
        const session = useSupabaseSession();
        if (!session.value) return navigateTo('/auth/signin');
        if (!session.value.user.user_metadata.organization_id) return navigateTo('/auth/onboarding');

        if (to.path === '/auth/onboarding' && session.value.user.user_metadata.organization_id) return navigateTo('/dashboard');
    }

    // Use pinia store in client because supabase session is not updated in the client if refreshSession() is executed
    if (import.meta.client) {
        const { user, session } = storeToRefs(userSessionStore());
        if (!session.value) return navigateTo('/auth/signin');
        if (!user.value?.user_metadata?.organization_id) return navigateTo('/auth/onboarding');

        if (to.path === '/auth/onboarding' && session.value.user.user_metadata.organization_id) return navigateTo('/dashboard');
    }
});

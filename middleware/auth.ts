export default defineNuxtRouteMiddleware((to) => {
    if (!to.path.startsWith('/dashboard')) return;

    const auth = useAuth();
    if (!auth.loggedIn) {
        return navigateTo('/auth/signin');
    }
});

<script setup lang="ts">
const route = useRoute();

watch(
    route,
    async () => {
        const code = route.query.code;
        if (code) {
            const { refresh_token } = await $fetch('/api/auth/google/callback', {
                query: { code },
            });

            return navigateTo(`/auth/onboarding?google_refresh_token=${refresh_token}`);
        }
        return navigateTo('/auth/signin');
    },
    { immediate: true }
);
</script>

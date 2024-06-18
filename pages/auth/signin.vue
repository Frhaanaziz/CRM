<script setup lang="ts">
definePageMeta({
    layout: 'auth',
});
const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const { query } = useRoute();

// Get redirect path from cookies
const cookieName = useRuntimeConfig().public.supabase.cookieName;
const redirectPath = useCookie(`${cookieName}-redirect-path`).value;
watch(
    user,
    () => {
        if (user.value) {
            // Clear cookie
            useCookie(`${cookieName}-redirect-path`).value = null;
            // Redirect to path
            return navigateTo((redirectPath === runtimeConfig.public.BASE_URL && '/dashboard') || '/dashboard');
        }
    },
    { immediate: true },
);

const { isSubmitting, state, submit } = useSignIn();

onMounted(async () => {
    const errorDescription = query.error_description as string;
    if (errorDescription) toast.error(errorDescription);
});
</script>

<template>
    <section class="p-32">
        <h1 class="text-3xl font-semibold">Log in</h1>

        <UForm :schema="signInSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" placeholder="Enter your email address" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" :disabled="isSubmitting" placeholder="Enter your password" />
            </UFormGroup>

            <div class="flex items-center justify-between">
                <div>
                    <UCheckbox name="remember_me" label="Remember Me" />
                </div>
                <NuxtLink to="/auth/forgot-password" class="font-medium text-brand">Forgot Password?</NuxtLink>
            </div>

            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Log In </UButton>
        </UForm>

        <p class="mt-4 text-center">
            Don't have an account?
            <NuxtLink to="/auth/signup" class="font-medium text-brand"> Sign Up </NuxtLink>
        </p>
    </section>
</template>

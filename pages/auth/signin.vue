<script setup lang="ts">
definePageMeta({
    layout: 'auth',
});
</script>

<template>
    <section class="p-32 flex flex-col justify-center items-center gap-10">
        <h1 class="text-3xl font-semibold text-center">Signin</h1>
        <div class="flex justify-center">
            <UButton>
                <LoginLink to="/api/login" external>
                    Sign in with Kinde
                </LoginLink>
            </UButton>
        </div>

        <p class="text-center">
            Don't have an account?
            <NuxtLink href="/auth/signup" class="text-brand font-medium">
                Sign Up
            </NuxtLink>
        </p>
    </section>
</template>

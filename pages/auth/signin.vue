<script setup lang="ts">
definePageMeta({
    layout: 'auth',
});
</script>

<template>
    <section class="flex flex-col items-center justify-center gap-10 p-32">
        <h1 class="text-center text-3xl font-semibold">Signin</h1>
        <div class="flex justify-center">
            <UButton>
                <LoginLink to="/api/login" external> Sign in with Kinde </LoginLink>
            </UButton>
        </div>

        <p class="text-center">
            Don't have an account?
            <NuxtLink href="/auth/signup" class="font-medium text-brand"> Sign Up </NuxtLink>
        </p>
    </section>
</template>

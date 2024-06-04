<script setup lang="ts">
definePageMeta({
    layout: 'auth'
})


const { isSubmitting, state, submit } = useSignIn()
</script>


<template>
    <section class="p-32">
        <h1 class="text-3xl font-semibold">Log in</h1>

        <UForm :schema="signInSchema" :state="state" class="space-y-4 mt-6" @submit="submit">
            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" :disabled="isSubmitting" />
            </UFormGroup>

            <div class="flex items-center justify-between">
                <div>
                    <UCheckbox name="remember_me" label="Remember Me" />

                </div>
                <NuxtLink to="/auth/forgot-password" class="text-brand font-medium">Forgot Password?</NuxtLink>
            </div>


            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting">
                Log In
            </UButton>
        </UForm>
        <LoginLink to="/api/login" external>
            Sign in Kinde
        </LoginLink>

        <p class="mt-4 text-center">Don't have an account? <NuxtLink to="/auth/signup" class="text-brand font-medium">
                Sign Up
            </NuxtLink>
        </p>
    </section>
</template>
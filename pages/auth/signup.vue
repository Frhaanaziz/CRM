<script setup lang="ts">
definePageMeta({
    layout: 'auth',
});

const { isSubmitting, state, submit } = useSignUp();
</script>

<template>
    <section class="p-32">
        <h1 class="text-2xl font-semibold">Create New Account</h1>
        <p class="mt-1">Start your 30 days free trial as an administrator</p>

        <UForm :schema="signUpSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
            <UFormGroup label="First Name" name="first_name">
                <UInput v-model="state.first_name" :disabled="isSubmitting" />
            </UFormGroup>

            <UFormGroup label="Last Name" name="last_name">
                <UInput v-model="state.last_name" :disabled="isSubmitting" />
            </UFormGroup>

            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" />
            </UFormGroup>

            <UFormGroup label="Phone" name="phone">
                <UInput v-model="state.phone" :disabled="isSubmitting" />
            </UFormGroup>

            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Sign Up </UButton>
        </UForm>

        <p class="mt-4 text-center">
            Already have an account?
            <NuxtLink href="/auth/signin" class="font-medium text-brand"> Sign In </NuxtLink>
        </p>
    </section>
</template>

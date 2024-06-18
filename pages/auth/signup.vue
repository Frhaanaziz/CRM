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
                <UInput v-model="state.first_name" :disabled="isSubmitting" placeholder="Enter your first name" />
            </UFormGroup>

            <UFormGroup label="Last Name" name="last_name">
                <UInput v-model="state.last_name" :disabled="isSubmitting" placeholder="Enter your last name" />
            </UFormGroup>

            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" :disabled="isSubmitting" placeholder="Enter your email address" />
            </UFormGroup>

            <UFormGroup label="Phone" name="phone">
                <UInput v-model="state.phone" :disabled="isSubmitting" placeholder="Enter your phone number" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" :disabled="isSubmitting" placeholder="Enter your password" />
            </UFormGroup>

            <UFormGroup label="Confirm Password" name="confirm_password">
                <UInput
                    v-model="state.confirm_password"
                    type="password"
                    :disabled="isSubmitting"
                    placeholder="Confirm your password"
                />
            </UFormGroup>

            <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting"> Sign Up </UButton>
        </UForm>

        <p class="mt-4 text-center">
            Already have an account? <NuxtLink to="/auth/signin" class="font-medium text-brand"> Sign In </NuxtLink>
        </p>
    </section>
</template>

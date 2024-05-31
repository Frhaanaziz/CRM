<script setup lang="ts">
import { signUpSchema } from '~/utils/validators/auth';
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
    layout: 'auth'
})

type SignUpType = z.infer<typeof signUpSchema>

const state = ref<SignUpType>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
})

async function onSubmit(event: FormSubmitEvent<SignUpType>) {
    // Do something with data
    console.log(toRaw(event.data))
}
</script>


<template>
    <section class="p-32">
        <h1 class="text-2xl font-semibold">Create New Account</h1>
        <p class="mt-1">Start your 30 days free trial as an administrator</p>


        <UForm :schema="signUpSchema" :state="state" class="space-y-4 mt-6" @submit="onSubmit">
            <UFormGroup label="First Name" name="first_name">
                <UInput v-model="state.first_name" />
            </UFormGroup>

            <UFormGroup label="Last Name" name="last_name">
                <UInput v-model="state.last_name" />
            </UFormGroup>

            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup label="Phone" name="phone">
                <UInput v-model="state.phone" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" />
            </UFormGroup>

            <UFormGroup label="Re-Enter Password" name="password_confirmation">
                <UInput v-model="state.password_confirmation" type="password" />
            </UFormGroup>

            <UButton type="submit" block size="md">
                Sign Up
            </UButton>
        </UForm>
    </section>
</template>
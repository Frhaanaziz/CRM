<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useStepper } from '@vueuse/core';

definePageMeta({
    layout: 'auth',
});

const formRef = ref();
const stepper = useStepper(['register', 'set-password']);

const { isSubmitting, state, submit } = useSignUp();

async function nextStep() {
    try {
        await formRef.value?.validate(['first_name', 'last_name', 'email']);
        stepper.goToNext();
    } catch (error) {
        // console.error('error', error);
    }
}
function useSignUp() {
    type SignUpType = z.infer<typeof signUpSchema>;

    const isSubmitting = ref(false);

    const initialState: SignUpType = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    };
    const state = ref<SignUpType>({ ...initialState });

    async function onSubmit(event: FormSubmitEvent<SignUpType>) {
        try {
            isSubmitting.value = true;
            await $fetch('/api/auth/sign-up', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            state.value = { ...initialState };
            await navigateTo({
                path: '/auth/verify-email',
                query: { email: event.data.email },
            });
        } catch (e) {
            console.error('Error creating account:', e);
            toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        state,
        isSubmitting,
        submit: onSubmit,
    };
}
</script>

<template>
    <section class="relative grid items-center p-32">
        <NuxtImg src="/images/pipeline-logo.png" alt="pipeline" height="32" class="absolute right-0 top-0 p-10" />

        <UCard
            v-if="stepper.isCurrent('register')"
            class="mx-auto w-[400px]"
            :ui="{
                body: {
                    base: 'space-y-5',
                    padding: 'px-10 py-10 sm:px-10 sm:py-10 ',
                },
            }"
        >
            <UButton color="black" block size="md" disabled>
                <NuxtImg src="/icons/google.svg" />
                Sign In with Google
            </UButton>

            <UDivider
                label="Or Sign In with Email"
                orientation="horizontal"
                :ui="{
                    container: {
                        base: 'text-gray-500',
                    },
                    label: 'text-xs',
                }"
            />
            <UForm ref="formRef" :schema="signUpSchema" :state="state" class="mt-6 space-y-4" @submit="submit">
                <UFormGroup label="First Name" name="first_name" required>
                    <UInput v-model="state.first_name" :disabled="isSubmitting" />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name" required>
                    <UInput v-model="state.last_name" :disabled="isSubmitting" />
                </UFormGroup>

                <UFormGroup label="Email" name="email" required>
                    <UInput v-model="state.email" type="email" :disabled="isSubmitting" />
                </UFormGroup>

                <UButton type="button" block size="md" :disabled="isSubmitting" :loading="isSubmitting" @click="nextStep"
                    >Continue</UButton
                >
            </UForm>

            <p class="text-slate-500">
                Already have an account?
                <NuxtLink to="/auth/signin" class="text-brand">Log In</NuxtLink>
            </p>

            <p class="text-xs text-slate-500">
                By signing up, you agree to our <NuxtLink class="underline" href="#">Terms of Service</NuxtLink> and
                <NuxtLink class="underline" href="#">Privacy Notice</NuxtLink>. You also agree to receive account-related emails
                from Pipeline, including tips and product updates.
            </p>

            <p class="text-xs text-slate-500">
                This page is protected by reCAPTCHA and the
                <NuxtLink class="underline" href="#">Google Privacy Policy</NuxtLink> and
                <NuxtLink class="underline" href="#">Terms of Service apply</NuxtLink>.
            </p>
        </UCard>

        <LazyUCard
            v-if="stepper.isCurrent('set-password')"
            class="mx-auto w-[400px]"
            :ui="{
                body: {
                    base: 'flex space-y-5 flex-col items-center justify-center',
                    padding: 'px-10 py-10 sm:px-10 sm:py-10 ',
                },
            }"
        >
            <UButton
                variant="ghost"
                icon="i-heroicons-chevron-left"
                color="black"
                class="self-start"
                @click="stepper.goToPrevious"
                >Back</UButton
            >

            <NuxtImg src="/icons/material-symbols_lock.svg" height="120" width="120" />
            <p class="text-xl font-semibold text-slate-700">Set password to get started.</p>

            <UForm :schema="signUpSchema" :state="state" class="w-full space-y-4" @submit="submit" @error="console.error">
                <UFormGroup label="Password" name="password" required>
                    <InputPassword v-model="state.password" :disabled="isSubmitting" placeholder="User 8 or more characters" />
                </UFormGroup>

                <UButton type="submit" block size="md" :disabled="isSubmitting" :loading="isSubmitting">Create Account</UButton>
            </UForm>
        </LazyUCard>
    </section>
</template>

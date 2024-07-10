<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const emit = defineEmits(['close']);
const closeModal = () => emit('close');

type ConnectEmailType = z.infer<typeof connectEmailSchema>;
const isSubmitting = ref(false);
const state = ref<ConnectEmailType>({
    smtp_host: '',
    smtp_username: '',
    smtp_password: '',
    smtp_secure: true,
    imap_host: '',
    imap_username: '',
    imap_password: '',
    imap_secure: true,
});
async function handleSubmit(event: FormSubmitEvent<ConnectEmailType>) {
    try {
        isSubmitting.value = true;

        await new Promise((resolve) => setTimeout(resolve, 1000));
        // await $fetch('/api/contacts', {
        //     method: 'POST',
        //     body: JSON.stringify(event.data),
        // });

        closeModal();
        toast.success('Email connected successfully.');
        await navigateTo('/auth/onboarding');
    } catch (e) {
        console.error('Failed to connect email', e);
        toast.error('Failed to connect email, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <UModal
        :ui="{
            base: 'p-4',
            width: 'sm:max-w-xl',
        }"
    >
        <div class="flex items-center justify-between">
            <p class="text-2xl font-bold text-slate-700">Connect Email</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" square @click="closeModal" />
        </div>

        <UDivider class="my-5" />

        <div class="space-y-5">
            <p class="text-xl font-bold text-slate-700">Enter your server credentials</p>

            <UForm
                :schema="connectEmailSchema"
                :state="state"
                class="grid grid-cols-2 gap-5"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="SMTP Host" name="smtp_host" required>
                    <UInput
                        v-model="state.smtp_host"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="e.g. smtp.custom server.com"
                    />
                </UFormGroup>

                <UFormGroup label="IMAP Host" name="imap_host" required>
                    <UInput
                        v-model="state.imap_host"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="e.g. smtp.custom server.com"
                    />
                </UFormGroup>

                <UFormGroup label="SMTP Username" name="smtp_username" required>
                    <UInput
                        v-model="state.smtp_username"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="e.g. email@domain.com"
                    />
                </UFormGroup>

                <UFormGroup label="IMAP Username" name="imap_username" required>
                    <UInput
                        v-model="state.imap_username"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="e.g. email@domain.com"
                    />
                </UFormGroup>

                <UFormGroup label="SMTP Password" name="smtp_password" required>
                    <InputPassword v-model="state.smtp_password" :disabled="isSubmitting" :loading="isSubmitting" />
                </UFormGroup>

                <UFormGroup label="IMAP Password" name="imap_password" required>
                    <InputPassword v-model="state.imap_password" :disabled="isSubmitting" :loading="isSubmitting" />
                </UFormGroup>

                <div class="flex items-center gap-4">
                    <UToggle id="smtp_secure" v-model="state.smtp_secure" />
                    <label for="smtp_secure" class="font-bold text-slate-700">SMTP Secure (SSL/TLS)</label>
                </div>

                <div class="flex items-center gap-4">
                    <UToggle id="imap_secure" v-model="state.imap_secure" />
                    <label for="imap_secure" class="font-bold text-slate-700">IMAP Secure (SSL/TLS)</label>
                </div>
            </UForm>
        </div>

        <UDivider class="my-5" />

        <div class="grid grid-cols-2 gap-5">
            <UButton variant="ghost" block>Cancel</UButton>
            <UButton block disabled>Save</UButton>
        </div>
    </UModal>
</template>

<script setup lang="ts">
const route = useRoute();
const { email } = route.query;
if (!email) throw createError({ statusCode: 404, message: 'Email not found' });

const isSending = ref(false);

async function resendEmail() {
    try {
        isSending.value = true;

        await $fetch('/api/auth/resend-verification-email', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        toast.success('Email sent successfully');
    } catch (e) {
        console.error('Error sending email:', e);
        toast.error(getErrorMessage(e));
    } finally {
        isSending.value = false;
    }
}
</script>

<template>
    <main>
        <NuxtLink href="/dashboard">
            <NuxtImg src="/images/pipeline-logo.png" alt="pipeline" height="32" class="absolute left-0 top-0 p-10" />
        </NuxtLink>

        <section class="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center gap-y-10">
            <div>
                <NuxtImg src="/images/undraw-mail-sent.svg" alt="Verify Email" />
            </div>
            <div class="space-y-5 text-slate-700">
                <h1 class="text-4xl font-bold">Please verify your email</h1>
                <p>
                    We sent a verification email to {{ email }}.<br />
                    Click the link in that email to start using Pipeline CRM.
                </p>
                <p>
                    Didn’t get it? Check your spam folder or
                    <button class="text-brand" :disabled="isSending" @click="resendEmail">send again.</button>
                </p>
            </div>
        </section>
        <div class="mx-auto mt-auto flex w-[800px] items-center gap-5 border-t pb-[60px] pt-10">
            <UButton to="/auth/signin" color="gray" size="2xs" class="px-8">Sign In</UButton>
            <NuxtLink :href="`mailto:${supportEmail}`" external class="text-sm text-slate-700">
                Need help or have a question?
            </NuxtLink>
        </div>
    </main>
</template>

<script setup lang="ts">
import LazyModalConnectEmailManual from '~/components/modal/ModalConnectEmailManual.vue';

const supabase = useSupabaseClient();
async function handleSignout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out, please try again.');
    }
    await navigateTo('/auth/signin');
}

const modal = useModal();
function openConnectEmailModal() {
    modal.open(LazyModalConnectEmailManual, {
        onClose: () => modal.close(),
    });
}
</script>

<template>
    <div>
        <NuxtImg src="/images/pipeline-logo.png" alt="pipeline" height="32" class="absolute left-0 top-0 p-10" />

        <main class="relative mx-auto min-h-screen w-[800px]">
            <section class="py-20">
                <div class="space-y-10">
                    <UProgress :value="33" class="pt-10" color="green" />
                    <div class="not-sr-only h-8" />
                    <div class="text-slate-700">
                        <h1 class="mb-5 text-4xl font-semibold">All sales activity in one place.</h1>
                        <p class="mb-1">Connect your email and your calendar</p>
                        <p class="text-slate-500">We'll sync email and meetings with Leads you add in Pipeline</p>
                    </div>
                </div>

                <NuxtImg src="/images/undraw-mail-opened.svg" alt="" height="247" width="280" class="my-10" />

                <UButton disabled>
                    <NuxtImg src="/icons/google.svg" />
                    Connect with Google
                </UButton>

                <p class="mt-4 text-slate-500">
                    Or, <button class="underline" @click="openConnectEmailModal">use another email provider</button>
                </p>
            </section>

            <section class="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t pb-[60px] pt-10">
                <div class="flex items-center gap-5">
                    <UButton to="/auth/signin" color="gray" size="2xs" class="px-8" @click="handleSignout">Logout</UButton>
                    <p class="text-sm text-slate-700">Need help or have a question?</p>
                </div>
                <UButton color="gray" size="2xs" class="px-5" icon="i-heroicons-chevron-right" trailing to="/auth/onboarding"
                    >Skip this</UButton
                >
            </section>
        </main>
    </div>
</template>

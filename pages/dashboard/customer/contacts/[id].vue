<script lang="ts" setup>
import LazyModalDelete from '~/components/modal/ModalDelete.vue';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { data: contact } = await useFetch(`/api/contacts/${id}`, {
    key: `contacts-${id}`,
    headers: useRequestHeaders(['cookie']),
});
if (!contact.value) throw createError({ status: 404, message: 'contact not found' });

const contactForm = ref<null | {
    submitForm: () => Promise<any>;
    resetForm: () => Promise<any>;
    isFormDirty: boolean;
    isUpdating: boolean;
}>(null);

async function handleDeleteContact() {
    try {
        await $fetch(`/api/contacts/${id}`, { method: 'DELETE' });

        toast.success('Contact has been deleted successfully.');
        await refreshNuxtData();
        await navigateTo('/dashboard/customer/contacts');
    } catch (e) {
        console.error('Failed to delete contact:', e);
        toast.error('Failed to delete contact, please try again later.');
    }
}
</script>

<template>
    <div v-if="contact" class="min-h-screen bg-base-200">
        <header class="sticky top-0 z-10 bg-base-100 shadow">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/customer/contacts" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>
                <UButton
                    variant="ghost"
                    icon="i-heroicons-trash"
                    color="black"
                    class="font-semibold"
                    @click="
                        modal.open(LazyModalDelete, {
                            onClose: () => modal.close(),
                            title: 'Contact',
                            description:
                                'Deleting contact will delete all records under the contact as well (for example opportunities, tasks, and activities). ',
                            onConfirm: handleDeleteContact,
                        })
                    "
                >
                    Delete
                </UButton>

                <template v-if="contactForm?.isFormDirty">
                    <LazyUButton
                        variant="ghost"
                        icon="i-heroicons-arrow-path"
                        color="black"
                        class="font-semibold"
                        :disabled="contactForm?.isUpdating"
                        @click="contactForm?.resetForm"
                    >
                        Reset
                    </LazyUButton>
                    <LazyUButton
                        variant="ghost"
                        icon="i-heroicons-bookmark"
                        color="black"
                        class="font-semibold"
                        :disabled="contactForm?.isUpdating"
                        @click="contactForm?.submitForm"
                    >
                        Save
                    </LazyUButton>
                </template>
            </div>

            <div v-if="contact && contact.company" class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl(contact)" size="md" />

                    <div class="flex flex-col gap-1">
                        <h1 class="text-xl font-semibold">{{ getUserFullName(contact) }}</h1>
                        <p v-if="contact.job_title" class="text-sm">
                            {{ contact.job_title }} &middot; {{ contact.company.name }}
                        </p>
                        <p v-else class="text-sm">{{ contact.company.name }}</p>
                    </div>
                </div>

                <div v-if="contact.user" class="flex items-center gap-2">
                    <UAvatar :src="contact.user.photo ?? getUserFallbackAvatarUrl(contact.user)" />
                    <div>
                        <p class="font-semibold">{{ getUserFullName(contact.user) }}</p>
                        <p class="text-xs">Owner</p>
                    </div>
                </div>
            </div>
        </header>

        <section class="m-4 grid gap-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <CardContactDetails ref="contactForm" :contact />
            </div>
        </section>
    </div>
</template>

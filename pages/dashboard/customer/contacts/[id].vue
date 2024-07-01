<script lang="ts" setup>
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignContact from '~/components/modal/ModalAssignContact.vue';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { data: contact } = await useFetch(`/api/contacts/${id}`, {
    key: `contacts-${id}`,
});
if (!contact.value) throw createError({ status: 404, message: 'contact not found' });

async function handleDeleteContact() {
    try {
        await $fetch(`/api/contacts/${id}`, { method: 'DELETE' });

        toast.success('Contact has been deleted successfully.');
        await refreshNuxtData('contacts');
        await navigateTo('/dashboard/customer/contacts');
    } catch (e) {
        console.error('Failed to delete contact:', e);
        toast.error('Failed to delete contact, please try again later.');
    }
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/customer/companies" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>
                <UButton
                    variant="ghost"
                    icon="i-heroicons-user"
                    color="black"
                    class="font-semibold"
                    @click="
                        modal.open(LazyModalAssignContact, {
                            onClose: () => modal.close(),
                            contact: { id: contact!.id },
                            userId: contact!.user_id ?? undefined,
                        })
                    "
                >
                    Assign
                </UButton>
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
            </div>

            <div v-if="contact && contact.company" class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />

                    <div class="flex flex-col gap-1">
                        <h1 class="text-xl font-semibold">{{ `${contact.first_name ?? ''} ${contact.last_name ?? ''}` }}</h1>
                        <p v-if="contact.job_title" class="text-sm">
                            {{ contact.job_title }} &middot; {{ contact.company.name }}
                        </p>
                        <p v-else class="text-sm">{{ contact.company.name }}</p>
                    </div>
                </div>

                <div v-if="contact.user" class="flex items-center gap-2">
                    <UAvatar :src="contact.user.photo ?? '/images/avatar-fallback.jpg'" />
                    <div>
                        <p class="font-semibold">{{ `${contact.user.first_name} ${contact.user.last_name}` }}</p>
                        <p class="text-xs">Owner</p>
                    </div>
                </div>
            </div>
        </header>

        <section class="m-4 grid gap-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">Contact</h2>
                            <UButton variant="outline" disabled>Verify Email</UButton>
                        </div>
                    </template>

                    <div v-if="contact" class="flex gap-6 text-sm sm:text-base">
                        <div class="text-weak grid shrink-0 grid-rows-8 gap-y-8">
                            <p>Email</p>
                            <p>First Name</p>
                            <p>Last Name</p>
                            <p>Job Title</p>
                            <p>Mobile Phone</p>
                            <p>Whatsapp</p>
                            <p>LinkedIn URL</p>
                            <p>Company Name</p>
                        </div>

                        <div class="grid grow grid-rows-8 gap-y-8 font-semibold">
                            <p class="line-clamp-1">{{ contact.email ?? '---' }}</p>
                            <p class="line-clamp-1">{{ contact.first_name ?? '---' }}</p>
                            <p class="line-clamp-1">{{ contact.last_name ?? '---' }}</p>
                            <p class="line-clamp-1">
                                {{ contact.job_title ?? '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ contact.mobile_phone ?? '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ contact.whatsapp ?? '---' }}
                            </p>

                            <NuxtLink
                                v-if="contact.linkedin"
                                :href="contact.linkedin"
                                external
                                target="_blank"
                                class="line-clamp-1 text-brand"
                            >
                                {{ contact.linkedin }}
                            </NuxtLink>
                            <p v-else>---</p>

                            <NuxtLink
                                v-if="contact.company"
                                :href="`/dashboard/customer/companies/${contact.company.id}`"
                                class="line-clamp-1 text-brand"
                                >{{ contact.company?.name }}</NuxtLink
                            >
                            <p v-else>---</p>
                        </div>
                    </div>
                </UCard>
            </div>
        </section>
    </div>
</template>

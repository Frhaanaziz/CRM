<script lang="ts" setup>
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useRefHistory } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAssignContact from '~/components/modal/ModalAssignContact.vue';

const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { data: contact, refresh: refreshContact } = await useFetch(`/api/contacts/${id}`, {
    key: `contacts-${id}`,
});
if (!contact.value) throw createError({ status: 404, message: 'contact not found' });

const { updateState, isUpdating, updateContact, formRef, submitForm, isFormDirty, resetForm } = useUpdateContact();

// onBeforeRouteLeave(() => {
//     const answer = window.confirm('Are you sure you want to leave?');
//     if (!answer) return false;
// });

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
function useUpdateContact() {
    type UpdateContactType = z.infer<typeof updateContactSchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        id,
        email: contact.value!.email ?? undefined,
        first_name: contact.value!.first_name ?? undefined,
        last_name: contact.value!.last_name ?? undefined,
        job_title: contact.value!.job_title ?? undefined,
        mobile_phone: contact.value!.mobile_phone ?? undefined,
        whatsapp: contact.value!.whatsapp ?? undefined,
        linkedin: contact.value!.linkedin ?? undefined,
        company_id: contact.value!.company_id,
    };
    const updateState = ref({ ...initialState });
    const { history, clear } = useRefHistory(updateState, { deep: true });
    const isDirty = computed(() => history.value.length > 1);
    const submit = async () => await formRef.value?.submit();

    const resetForm = async () => {
        formRef.value?.clear();
        updateState.value = initialState;
        await nextTick();
        clear();
    };

    async function updateContact(event: FormSubmitEvent<UpdateContactType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/contacts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Contact updated successfully.');
            clear();
            await refreshContact();
        } catch (e) {
            console.error('Failed to update contact', e);
            toast.error('Failed to update contact, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { updateState, isUpdating, updateContact, formRef, submitForm: submit, isFormDirty: isDirty, resetForm };
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/customer/contacts" class="flex h-10 w-10 items-center justify-center border">
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

                <template v-if="isFormDirty">
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-arrow-path"
                        color="black"
                        class="font-semibold"
                        :disabled="isUpdating"
                        @click="resetForm"
                    >
                        Reset
                    </UButton>
                    <UButton
                        variant="ghost"
                        icon="i-heroicons-bookmark"
                        color="black"
                        class="font-semibold"
                        :disabled="isUpdating"
                        @click="submitForm"
                    >
                        Save
                    </UButton>
                </template>
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
                        <div class="text-weak grid shrink-0 grid-rows-7 gap-y-8">
                            <p>Email</p>
                            <p>First Name</p>
                            <p>Last Name</p>
                            <p>Job Title</p>
                            <p>Mobile Phone</p>
                            <p>Whatsapp</p>
                            <p>LinkedIn URL</p>
                            <!-- <p>Company Name</p> -->
                        </div>

                        <UForm
                            ref="formRef"
                            :schema="updateContactSchema"
                            :state="updateState"
                            class="grid grow grid-rows-7 gap-y-8 font-semibold"
                            :disabled="isUpdating"
                            @submit="updateContact"
                            @error="console.error"
                        >
                            <UFormGroup name="email">
                                <UInput v-model="updateState.email" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="first_name">
                                <UInput v-model="updateState.first_name" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="last_name">
                                <UInput v-model="updateState.last_name" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="job_title">
                                <UInput v-model="updateState.job_title" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="mobile_phone">
                                <UInput v-model="updateState.mobile_phone" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="whatsapp">
                                <UInput v-model="updateState.whatsapp" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="linkedin">
                                <UInput v-model="updateState.linkedin" variant="none" :padded="false" />
                            </UFormGroup>
                        </UForm>
                        <!-- <div class="grid grow grid-rows-8 gap-y-8 font-semibold">
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
                        </div> -->
                    </div>
                </UCard>
            </div>
        </section>
    </div>
</template>

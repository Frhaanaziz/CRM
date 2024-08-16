<script setup lang="ts">
import type { Company, Contact, Lead } from '~/types';
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const props = defineProps<{
    contacts: Contact[];
    lead_id: Lead['id'];
    company_id: Company['id'];
}>();

const store = globalStore();

const isCreatingContact = ref(false);

const initialState = {
    company_id: props.company_id,
    first_name: '',
    email: undefined,
    last_name: undefined,
    mobile_phone: undefined,
    job_title: undefined,
};
const state = ref({ ...initialState });
const isSubmitting = ref(false);

type AddContactType = z.infer<typeof addContactSchema>;
async function handleSubmit(event: FormSubmitEvent<AddContactType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/contacts', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        isCreatingContact.value = false;
        state.value = { ...initialState };
        await refreshNuxtData();
    } catch (e) {
        console.error('Failed to add contact', e);
        toast.error('Failed to add contact, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}

function getContact(id: string) {
    return props.contacts.find((contact) => contact.id === parseInt(id));
}
</script>

<template>
    <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-slate-700">Contacts</h2>
                <UButton variant="ghost" square color="black" :padded="false" @click="isCreatingContact = !isCreatingContact">
                    <UIcon name="i-heroicons-plus" class="h-6 w-6" />
                </UButton>
            </div>
        </template>

        <div v-if="isCreatingContact" class="bg-brand-50 p-4">
            <LazyUForm :schema="addContactSchema" :state class="space-y-3" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="First Name" name="first_name" required>
                    <UInput v-model="state.first_name" :disabled="isSubmitting" placeholder="e.g. John Doe" />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name">
                    <UInput v-model="state.last_name" :disabled="isSubmitting" placeholder="e.g. Pipeline.co.id" />
                </UFormGroup>

                <UFormGroup label="Title" name="job_title">
                    <UInput v-model="state.job_title" :disabled="isSubmitting" placeholder="e.g. CEO" />
                </UFormGroup>

                <UFormGroup label="Mobile Phone" name="mobile_phone">
                    <UInput v-model="state.mobile_phone" :disabled="isSubmitting" placeholder="e.g. +62 812 5555 8888" />
                </UFormGroup>

                <UFormGroup label="Email" name="email">
                    <UInput v-model="state.email" :disabled="isSubmitting" placeholder="e.g. email@domain.com" />
                </UFormGroup>

                <div class="grid grid-cols-2 gap-2">
                    <UButton
                        type="button"
                        variant="ghost"
                        color="black"
                        :disabled="isSubmitting"
                        block
                        @click="isCreatingContact = false"
                    >
                        Cancel
                    </UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting" block>Save</UButton>
                </div>
            </LazyUForm>
        </div>

        <UAccordion
            variant="outline"
            multiple
            :items="
                contacts.map((contact) => ({
                    content: contact.id.toString(),
                    slot: contact.id.toString(),
                }))
            "
            :ui="{
                wrapper: 'w-full flex flex-col gap-2',
            }"
        >
            <template #default="{ item, open }">
                <div
                    class="flex cursor-pointer items-center justify-between px-2 py-1"
                    :class="{ '[&:not(:last-child)]:border-b': !open }"
                >
                    <div class="text-start text-slate-700">
                        <NuxtLink
                            :href="`/dashboard/customer/contacts/${getContact(item.content)?.id}`"
                            class="font-semibold text-brand"
                        >
                            {{ getUserFullName(getContact(item.content)) }}
                        </NuxtLink>
                        <p v-if="getContact(item.content)?.job_title" class="text-xs">
                            {{ getContact(item.content)?.job_title }}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <UButton square icon="i-heroicons-envelope-solid" variant="ghost" color="black" disabled />
                        <UButton
                            square
                            icon="i-heroicons-phone-solid"
                            variant="ghost"
                            color="black"
                            :disabled="!getContact(item.content)?.mobile_phone"
                            @click.stop="store.makeCall({ contact: getContact(item.content)!, lead_id })"
                        />
                    </div>
                </div>
            </template>

            <template v-for="contact in contacts" :key="contact.id" #[contact.id.toString()]>
                <ul class="space-y-2 px-2">
                    <li class="grid grid-cols-12 items-center text-slate-700">
                        <p class="col-span-4 font-semibold">Mobile Phone</p>
                        <p class="col-span-8">{{ contact.mobile_phone ?? '---' }}</p>
                    </li>
                    <li class="grid grid-cols-12 items-center text-slate-700">
                        <p class="col-span-4 font-semibold">Email</p>
                        <p class="col-span-8">{{ contact.email ?? '---' }}</p>
                    </li>
                    <li class="grid grid-cols-12 items-center text-slate-700">
                        <p class="col-span-4 font-semibold">LinkedIn</p>
                        <p class="col-span-8 flex items-center justify-between gap-2">
                            <span class="truncate">
                                {{ contact.linkedin ?? '---' }}
                            </span>
                            <NuxtLink v-if="contact.linkedin" :href="contact.linkedin" external target="_blank">
                                <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5 text-brand" />
                            </NuxtLink>
                        </p>
                    </li>
                </ul>
            </template>
        </UAccordion>
        <!-- <ul v-if="!!contacts.length" class="text-slate-700">
            <li
                v-for="contact in contacts"
                :key="contact.id"
                class="flex items-center justify-between px-2 py-1 [&:not(:last-child)]:border-b"
            >
                <div class="text-slate-700">
                    <p class="font-semibold">{{ getUserFullName(contact) }}</p>
                    <p v-if="contact.job_title" class="text-xs">{{ contact?.job_title }}</p>
                </div>
                <div class="flex gap-2">
                    <UButton square icon="i-heroicons-envelope-solid" variant="ghost" color="black" disabled />
                    <UButton
                        square
                        icon="i-heroicons-phone-solid"
                        variant="ghost"
                        color="black"
                        :disabled="!contact.mobile_phone"
                        @click="store.makeCall({ contact, lead_id })"
                    />
                </div>
            </li>
        </ul> -->

        <UButton
            v-if="!(isCreatingContact || contacts?.length > 0)"
            variant="ghost"
            color="black"
            block
            class="justify-start text-slate-700"
            @click="isCreatingContact = true"
        >
            Add New Contact
        </UButton>
    </UCard>
</template>

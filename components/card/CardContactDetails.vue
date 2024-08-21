<script lang="ts" setup>
import { useRefHistory } from '@vueuse/core';
import type { z } from 'zod';
import type { Contact } from '~/types';
import type { FormSubmitEvent } from '#ui/types';

const props = defineProps<{
    contact: Contact;
}>();
const { contact } = toRefs(props);

const isVerifyingEmail = ref(false);

const { updateState, isUpdating, updateContact, formRef, submitForm, isFormDirty, resetForm } = useUpdateContact();
defineExpose({ submitForm, resetForm, isFormDirty, isUpdating });

onBeforeRouteLeave(() => {
    if (isFormDirty.value) {
        return window.confirm('Are you sure you want to leave?, you have unsaved changes.');
    }
});

function useUpdateContact() {
    type UpdateContactType = z.infer<typeof updateContactSchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        id: contact.value.id,
        company_id: contact.value.company_id,
        email: contact.value.email || undefined,
        first_name: contact.value.first_name || undefined,
        last_name: contact.value.last_name || undefined,
        job_title: contact.value.job_title || undefined,
        linkedin: contact.value.linkedin || undefined,
        mobile_phone: contact.value.mobile_phone || undefined,
        whatsapp: contact.value.whatsapp || undefined,
    };
    const updateState = ref({ ...initialState });
    const { history, clear } = useRefHistory(updateState, { deep: true });
    const isDirty = computed(() => history.value.length > 1);
    const submit = async () => await formRef.value?.submit();

    const resetForm = async () => {
        formRef.value?.clear();
        updateState.value = { ...initialState };
        await nextTick();
        clear();
    };

    async function updateContact(event: FormSubmitEvent<UpdateContactType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/contacts/${contact.value.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Contact updated successfully.');
            clear();
            await refreshNuxtData();
        } catch (e) {
            console.error('Failed to update contact', e);
            toast.error('Failed to update contact, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { updateState, isUpdating, updateContact, formRef, submitForm: submit, isFormDirty: isDirty, resetForm };
}
async function verifyEmail() {
    try {
        isVerifyingEmail.value = true;

        await $fetch(`/api/emails/verify`, {
            method: 'POST',
            body: JSON.stringify({ email: contact.value.email }),
        });

        await $fetch(`/api/contacts/${contact.value.id}`, {
            method: 'PUT',
            body: JSON.stringify({ id: contact.value.id, is_valid_email: true }),
        });

        await refreshNuxtData();
        toast.success('Email verified successfully.');
    } catch (e) {
        console.error('Failed to verify email', e);
        toast.error('Email verification failed');
    } finally {
        isVerifyingEmail.value = false;
    }
}
</script>

<template>
    <UCard v-if="contact">
        <template #header>
            <h2 class="font-semibold text-slate-700">Contact Information</h2>
        </template>

        <UForm
            ref="formRef"
            :schema="updateContactSchema"
            :state="updateState"
            :disabled="isUpdating"
            @submit="updateContact"
            @error="console.error"
        >
            <ul class="grid grid-cols-1 gap-2 text-slate-700">
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">First Name</p>
                    <UFormGroup name="first_name" class="col-span-8">
                        <UInput
                            v-model="updateState.first_name"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1 ',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Last Name</p>
                    <UFormGroup name="last_name" class="col-span-8">
                        <UInput
                            v-model="updateState.last_name"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1 ',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Title</p>
                    <UFormGroup name="job_title" class="col-span-8">
                        <UInput
                            v-model="updateState.job_title"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1 ',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Mobile Phone</p>
                    <UFormGroup name="mobile_phone" class="col-span-8">
                        <UInput
                            v-model="updateState.mobile_phone"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1 ',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Email</p>
                    <UFormGroup name="email" class="col-span-8">
                        <div class="flex items-center gap-2">
                            <UInput
                                v-model="updateState.email"
                                placeholder="---"
                                class="flex-1"
                                :ui="{
                                    color: {
                                        white: {
                                            outline: 'ring-0 shadow-none hover:ring-1 ',
                                        },
                                    },
                                }"
                            >
                                <template v-if="contact.email" #leading>
                                    <UIcon
                                        v-if="contact.is_valid_email"
                                        name="i-heroicons-shield-check"
                                        class="h-5 w-5 text-green-700"
                                    />
                                    <UIcon v-else name="i-heroicons-shield-exclamation" class="h-5 w-5 text-red-700" />
                                </template>
                            </UInput>

                            <UButton
                                v-if="!contact.is_valid_email || contact.email"
                                variant="outline"
                                size="xs"
                                :disabled="isVerifyingEmail"
                                @click="verifyEmail"
                            >
                                Verify
                            </UButton>
                        </div>
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Linkedin</p>
                    <UFormGroup name="linkedin" class="col-span-8">
                        <div class="flex items-center gap-2">
                            <UInput
                                v-model="updateState.linkedin"
                                class="flex-1"
                                placeholder="---"
                                :ui="{
                                    color: {
                                        white: {
                                            outline: 'ring-0 shadow-none hover:ring-1  text-brand',
                                        },
                                    },
                                }"
                            />
                            <NuxtLink
                                v-if="contact.linkedin"
                                :href="contact.linkedin"
                                target="_blank"
                                external
                                class="grid content-center"
                            >
                                <UIcon name="i-heroicons-arrow-top-right-on-square" color="black" class="h-5 w-5" />
                            </NuxtLink>
                        </div>
                    </UFormGroup>
                </li>
            </ul>
        </UForm>
        <!-- <div class="flex gap-6 text-sm sm:text-base">

                <UFormGroup name="linkedin">
                    <div class="flex items-center justify-between gap-2">
                        <UInput
                            v-model="updateState.linkedin"
                            class="flex-1"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1  text-brand',
                                    },
                                },
                            }"
                        />
                        <NuxtLink
                            v-if="contact.linkedin"
                            :href="contact.linkedin"
                            target="_blank"
                            external
                            class="grid content-center"
                        >
                            <UIcon name="i-heroicons-arrow-top-right-on-square" color="black" class="h-5 w-5" />
                        </NuxtLink>
                    </div>
                </UFormGroup>
        </div> -->
    </UCard>
</template>

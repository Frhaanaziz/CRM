<script lang="ts" setup>
import { useRefHistory } from '@vueuse/core';
import type { z } from 'zod';
import type { Contact } from '~/types';
import type { FormSubmitEvent } from '#ui/types';

const props = defineProps<{
    contact: Contact;
}>();
const { contact } = toRefs(props);

const { updateState, isUpdating, updateContact, formRef, submitForm, isFormDirty, resetForm } = useUpdateContact();

defineExpose({ submitForm, resetForm, isFormDirty, isUpdating });
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

// onBeforeRouteLeave(() => {
//     const answer = window.confirm('Are you sure you want to leave?');
//     if (!answer) return false;
// });
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">CONTACT</h2>
                <UButton v-if="!contact?.is_valid_email" variant="outline" disabled>Verify Email</UButton>
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
                <!-- <p>Preferred Method of Contact</p> -->
            </div>

            <UForm
                ref="formRef"
                :schema="updateContactSchema"
                :state="updateState"
                class="grid grow grid-rows-7 items-center gap-y-6 font-semibold"
                :disabled="isUpdating"
                @submit="updateContact"
                @error="console.error"
            >
                <UFormGroup name="email">
                    <UInput
                        v-model="updateState.email"
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

                <UFormGroup name="first_name">
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

                <UFormGroup name="last_name">
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

                <UFormGroup name="job_title">
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

                <UFormGroup name="mobile_phone">
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

                <UFormGroup name="whatsapp">
                    <UInput
                        v-model="updateState.whatsapp"
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
            </UForm>
            <!-- <div class="grid grow grid-rows-7 gap-y-8 font-semibold">
                <p class="line-clamp-1">{{ contact.email ?? '---' }}</p>
                <p class="line-clamp-1">{{ contact.first_name ?? '---' }}</p>
                <p class="line-clamp-1">{{ contact.last_name ?? '---' }}</p>
                <p class="line-clamp-1">{{ contact.job_title ?? '---' }}</p>
                <p class="line-clamp-1">{{ contact.mobile_phone ?? '---' }}</p>
                <p class="line-clamp-1">{{ contact.whatsapp ?? '---' }}</p>
                <NuxtLink v-if="contact.linkedin" :href="contact.linkedin" external class="line-clamp-1 text-brand">{{
                    contact.linkedin
                }}</NuxtLink>
            </div> -->
        </div>
    </UCard>
</template>

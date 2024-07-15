<script setup lang="ts">
import LazyModalAddCompanyToCRM from '~/components/modal/ModalAddCompanyToCRM.vue';
import LazyModalAddB2BContact from '~/components/modal/ModalAddB2BContact.vue';
import type { B2BCompany, B2BContact, City, Industry, Province, Size } from '~/types';
import type { AccordionItem, FormSubmitEvent } from '#ui/types';
import { useRefHistory } from '@vueuse/core';
import type { z } from 'zod';

interface IB2BCompany extends B2BCompany {
    industry?: Pick<Industry, 'name' | 'id'>;
    size?: Pick<Size, 'size_range' | 'id'>;
    province?: Pick<Province, 'name' | 'id'>;
    city?: Pick<City, 'name' | 'id'>;
    b2b_contacts: B2BContact[];
}

const modal = useModal();
const id = useRoute().params.id;
const { data: company, refresh: refreshCompany } = await useFetch<IB2BCompany>(`/api/b2b-companies/${id}`, {
    key: `b2b-companies-${id}`,
    method: 'GET',
});
if (!company.value) throw createError({ status: 404, message: 'B2B Company not found' });

const [{ data: industriesOption }, { data: sizesOption }, { data: provincesOption }, { data: citiesOption }] = await Promise.all([
    useLazyFetch('/api/industries', {
        transform: (industries) => industries.map(({ id, name }) => ({ value: id, label: name })),
    }),
    useLazyFetch('/api/sizes', { transform: (sizes) => sizes.map(({ id, size_range }) => ({ value: id, label: size_range })) }),
    useLazyFetch('/api/provinces', { transform: (provinces) => provinces.map(({ id, name }) => ({ value: id, label: name })) }),
    useLazyFetch('/api/cities', { transform: (cities) => cities.map(({ id, name }) => ({ value: id, label: name })) }),
]);

const accordionItems = computed(() =>
    company.value!.b2b_contacts.map(
        (contact) =>
            ({
                content: contact.id.toString(),
                slot: contact.id.toString(),
            }) satisfies AccordionItem
    )
);
function getB2BContact(id: number) {
    return company.value!.b2b_contacts.find((contact) => contact.id === id);
}

const { updateState, isUpdating, updateCompany, formRef, submitForm, isFormDirty, resetForm } = useUpdateB2BCompany();

function openAddToCRMModal() {
    const firstContact = company.value?.b2b_contacts[0];
    if (!firstContact) {
        toast.error('Please add a contact to this company first.');
        return;
    }
    modal.open(LazyModalAddCompanyToCRM, {
        onClose: () => modal.close(),
        contact: firstContact,
        company: company.value!,
    });
}
function openAddContactModal() {
    modal.open(LazyModalAddB2BContact, {
        onClose: () => modal.close(),
        company_id: company.value!.id,
    });
}
function useUpdateB2BCompany() {
    type UpdateB2BCompanyType = z.infer<typeof updateB2BCompanySchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        id,
        name: company.value!.name,
        website: company.value!.website || undefined,
        linkedin: company.value!.linkedin || undefined,
        phone: company.value!.phone || undefined,
        email: company.value!.email || undefined,
        industry_id: company.value!.industry?.id || undefined,
        size_id: company.value!.size?.id || undefined,
        province_id: company.value!.province?.id || undefined,
        city_id: company.value!.city?.id || undefined,
        location: company.value!.location || undefined,
        zip_code: company.value!.zip_code || undefined,
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

    async function updateCompany(event: FormSubmitEvent<UpdateB2BCompanyType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/b2b-companies/${id}`, {
                method: 'PUT' as any,
                body: JSON.stringify(event.data),
            });

            toast.success('Company updated successfully.');
            clear();
            await refreshCompany();
        } catch (e) {
            console.error('Failed to update company', e);
            toast.error('Failed to update company, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { updateState, isUpdating, updateCompany, formRef, submitForm: submit, isFormDirty: isDirty, resetForm };
}
</script>

<template>
    <div v-if="company" class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="flex items-center border-b">
                <NuxtLink href="/dashboard/resources/b2b-database" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>

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

            <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <UAvatar :src="company.avatar ?? getFallbackAvatarUrl(company.name)" size="lg" />
                    <div>
                        <h1 class="text-lg font-bold">{{ company.name }}</h1>
                        <p class="text-sm">
                            {{ company.industry?.name }}
                        </p>
                    </div>
                </div>

                <UButton
                    variant="outline"
                    icon="i-heroicons-plus"
                    :trailing="false"
                    class="hidden sm:flex"
                    @click="openAddToCRMModal"
                >
                    Add to CRM
                </UButton>
            </div>
        </header>

        <section class="grid gap-4 py-3 md:grid-cols-2">
            <div class="flex flex-col gap-4">
                <UCard>
                    <template #header>
                        <h2 class="text-xl font-semibold">OVERVIEW</h2>
                    </template>

                    <h3 class="font-semibold">Description</h3>
                    <p class="mt-1 text-sm">
                        {{ company.description }}
                    </p>

                    <template v-if="company.specialities">
                        <h3 class="mt-5 font-semibold">Specialities</h3>
                        <p class="mt-1 text-sm">
                            {{ company.specialities }}
                        </p>
                    </template>
                </UCard>

                <UCard>
                    <template #header>
                        <h2 class="text-xl font-semibold">DETAILS</h2>
                    </template>

                    <div class="flex gap-6 text-sm sm:text-base">
                        <div class="text-weak grid shrink-0 grid-rows-10 gap-y-8">
                            <p>Company Name</p>
                            <p>Website</p>
                            <p>LinkedIn URL</p>
                            <p>Phone</p>
                            <p>Email</p>
                            <p>Industry</p>
                            <p>Size</p>
                            <p>Province</p>
                            <p>City</p>
                            <p>Location</p>
                            <p>ZIP/Postal Code</p>
                        </div>

                        <UForm
                            ref="formRef"
                            :schema="updateB2BCompanySchema"
                            :state="updateState"
                            class="grid grow grid-rows-10 font-semibold"
                            :disabled="isUpdating"
                            @submit="updateCompany"
                            @error="console.error"
                        >
                            <UFormGroup name="name">
                                <UInput
                                    v-model="updateState.name"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="website">
                                <div class="flex items-center justify-between gap-2">
                                    <UInput
                                        v-model="updateState.website"
                                        class="flex-1"
                                        placeholder="---"
                                        disabled
                                        :ui="{
                                            color: {
                                                white: {
                                                    outline: 'ring-0 shadow-none hover:ring-1  text-brand',
                                                },
                                            },
                                        }"
                                    />
                                    <NuxtLink
                                        v-if="company.website"
                                        :href="company.website"
                                        target="_blank"
                                        external
                                        class="grid content-center"
                                    >
                                        <UIcon name="i-heroicons-arrow-top-right-on-square" color="black" class="h-5 w-5" />
                                    </NuxtLink>
                                </div>
                            </UFormGroup>

                            <UFormGroup name="linkedin">
                                <div class="flex items-center justify-between gap-2">
                                    <UInput
                                        v-model="updateState.linkedin"
                                        class="flex-1"
                                        placeholder="---"
                                        disabled
                                        :ui="{
                                            color: {
                                                white: {
                                                    outline: 'ring-0 shadow-none hover:ring-1  text-brand',
                                                },
                                            },
                                        }"
                                    />
                                    <NuxtLink
                                        v-if="company.linkedin"
                                        :href="company.linkedin"
                                        target="_blank"
                                        external
                                        class="grid content-center"
                                    >
                                        <UIcon name="i-heroicons-arrow-top-right-on-square" color="black" class="h-5 w-5" />
                                    </NuxtLink>
                                </div>
                            </UFormGroup>

                            <UFormGroup name="phone">
                                <UInput
                                    v-model="updateState.phone"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="email">
                                <UInput
                                    v-model="updateState.email"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="industry_id">
                                <USelectMenu
                                    v-model="updateState.industry_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="industriesOption ?? []"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="size_id">
                                <USelectMenu
                                    v-model="updateState.size_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="sizesOption ?? []"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="province_id">
                                <USelectMenu
                                    v-model="updateState.province_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="provincesOption ?? []"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="city_id">
                                <USelectMenu
                                    v-model="updateState.city_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="citiesOption ?? []"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="location">
                                <UInput
                                    v-model="updateState.location"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>

                            <UFormGroup name="zip_code">
                                <UInput
                                    v-model="updateState.zip_code"
                                    placeholder="---"
                                    disabled
                                    :ui="{
                                        color: {
                                            white: {
                                                outline: 'ring-0 shadow-none hover:ring-1 ',
                                            },
                                        },
                                    }"
                                />
                            </UFormGroup>
                        </UForm>
                    </div>
                </UCard>
            </div>

            <div>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">CONTACTS</h2>
                            <UButton icon="i-heroicons-plus" variant="ghost" square color="black" @click="openAddContactModal" />
                        </div>
                    </template>

                    <UAccordion
                        variant="outline"
                        multiple
                        :items="accordionItems"
                        :ui="{
                            wrapper: 'w-full flex flex-col gap-2',
                        }"
                    >
                        <template #default="{ item, open }">
                            <UButton color="gray" variant="ghost" class="border p-4">
                                <div class="flex gap-4">
                                    <UAvatar :src="getUserFallbackAvatarUrl(getB2BContact(parseInt(item.content)))" size="md" />
                                    <div>
                                        <p class="font-semibold">
                                            {{
                                                `${getB2BContact(parseInt(item.content))?.first_name ?? ''} ${getB2BContact(parseInt(item.content))?.last_name ?? ''}`
                                            }}
                                        </p>
                                        <p class="text-start text-xs">
                                            {{ getB2BContact(parseInt(item.content))?.job_title ?? '---' }}
                                        </p>
                                    </div>
                                </div>

                                <template #trailing>
                                    <UIcon
                                        name="i-heroicons-chevron-right-20-solid"
                                        class="ms-auto h-5 w-5 transform transition-transform duration-200"
                                        :class="[open && 'rotate-90']"
                                    />
                                </template>
                            </UButton>
                        </template>

                        <template v-for="b2b_contact in company.b2b_contacts" :key="b2b_contact.id" #[b2b_contact.id.toString()]>
                            <div class="flex gap-6 p-4 text-sm sm:text-base">
                                <div class="text-weak grid shrink-0 grid-rows-7 gap-y-8">
                                    <p>Email</p>
                                    <p>First Name</p>
                                    <p>Last Name</p>
                                    <p>Job Title</p>
                                    <p>Mobile Phone</p>
                                    <p>Whatsapp</p>
                                    <p>LinkedIn URL</p>
                                </div>

                                <div class="text-default grid grow grid-rows-7 gap-y-8 font-semibold">
                                    <p>{{ b2b_contact.email || '---' }}</p>
                                    <p>{{ b2b_contact.first_name || '---' }}</p>
                                    <p>{{ b2b_contact.last_name || '---' }}</p>
                                    <p>
                                        {{ b2b_contact.job_title || '---' }}
                                    </p>
                                    <p>
                                        {{ b2b_contact.mobile_phone || '---' }}
                                    </p>
                                    <p>
                                        {{ b2b_contact.whatsapp || '---' }}
                                    </p>

                                    <NuxtLink
                                        v-if="b2b_contact.linkedin"
                                        :href="b2b_contact.linkedin"
                                        external
                                        target="_blank"
                                        class="text-brand"
                                    >
                                        {{ b2b_contact.linkedin }}
                                    </NuxtLink>
                                    <p v-else>---</p>
                                </div>
                            </div>
                        </template>
                    </UAccordion>
                    <UButton
                        v-if="!company.b2b_contacts.length"
                        variant="ghost"
                        color="black"
                        block
                        :padded="false"
                        class="text-weak justify-start"
                        @click="openAddContactModal"
                    >
                        Add New Contact
                    </UButton>
                </UCard>
            </div>
        </section>
    </div>
</template>

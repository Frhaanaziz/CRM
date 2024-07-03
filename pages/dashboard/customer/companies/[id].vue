<script lang="ts" setup>
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useRefHistory } from '@vueuse/core';
import LazyModalDelete from '~/components/modal/ModalDelete.vue';
import LazyModalAddCompanyContact from '~/components/modal/ModalAddCompanyContact.vue';
import LazyModalAddCompanyPrimaryContact from '~/components/modal/ModalAddCompanyPrimaryContact.vue';
import LazyModalEditCompanyPrimaryContact from '~/components/modal/ModalEditCompanyPrimaryContact.vue';
import LazyModalAssignCompany from '~/components/modal/ModalAssignCompany.vue';
const modal = useModal();
const id = parseInt(useRoute().params.id as string);

const { data: company, refresh: refreshCompany } = await useFetch(`/api/companies/${id}`, {
    key: `companies-${id}`,
});
if (!company.value) throw createError({ status: 404, message: 'Company not found' });

const { updateState, isUpdating, updateCompany, formRef, submitForm, isFormDirty, resetForm } = useUpdateCompany();

async function handleDeleteCompanies() {
    try {
        await $fetch(`/api/companies/${id}`, { method: 'DELETE' });

        toast.success('Company has been deleted successfully.');
        await refreshNuxtData('companies');
        await navigateTo('/dashboard/customer/companies');
    } catch (e) {
        console.error('Failed to delete company:', e);
        toast.error('Failed to delete company, please try again later.');
    }
}

function useUpdateCompany() {
    type UpdateCompanyType = z.infer<typeof updateCompanySchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const updateState = ref({
        id,
        name: company.value!.name,
        phone: company.value!.phone ?? undefined,
        industry_id: company.value!.industry_id ?? undefined,
        size_id: company.value!.size_id ?? undefined,
        country_id: company.value!.country_id ?? undefined,
        province_id: company.value!.province_id ?? undefined,
        city_id: company.value!.city_id ?? undefined,
        street_1: company.value!.street_1 ?? undefined,
        street_2: company.value!.street_2 ?? undefined,
        street_3: company.value!.street_3 ?? undefined,
        postal_code: company.value!.postal_code ?? undefined,
    });
    const { history, undo } = useRefHistory(updateState, { deep: true, capacity: 1 });
    const isDirty = computed(() => history.value.length > 1);
    const submit = async () => await formRef.value?.submit();

    const resetForm = () => {
        undo();
        formRef.value?.clear();
        updateState.value = {
            id,
            name: company.value!.name,
            phone: company.value!.phone ?? undefined,
            industry_id: company.value!.industry_id ?? undefined,
            size_id: company.value!.size_id ?? undefined,
            country_id: company.value!.country_id ?? undefined,
            province_id: company.value!.province_id ?? undefined,
            city_id: company.value!.city_id ?? undefined,
            street_1: company.value!.street_1 ?? undefined,
            street_2: company.value!.street_2 ?? undefined,
            street_3: company.value!.street_3 ?? undefined,
            postal_code: company.value!.postal_code ?? undefined,
        };
    };

    async function updateCompany(event: FormSubmitEvent<UpdateCompanyType>) {
        try {
            isUpdating.value = true;

            await new Promise((resolve) => setTimeout(resolve, 1000));
            // await $fetch('/api/companies', {
            //     method: 'POST',
            //     body: JSON.stringify(event.data),
            // });

            toast.success('Company updated successfully.');
            undo();
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
                        modal.open(LazyModalAssignCompany, {
                            onClose: () => modal.close(),
                            company: { id: company!.id },
                            userId: company!.user_id ?? undefined,
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
                            title: 'Company',
                            description:
                                'Deleting company will delete all records under the company as well (for example opportunities, tasks, and activities). Are you sure to delete this Company? You can’t undo this action.',
                            onConfirm: handleDeleteCompanies,
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

            <div v-if="company" class="flex items-center justify-between p-4">
                <div class="flex flex-col gap-1">
                    <h1 class="text-xl font-semibold">{{ company.name }}</h1>
                    <p class="text-sm">Company</p>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <p class="text-weak font-semibold">Rp35.000.000</p>
                        <p class="text-weak text-xs">Annual Revenue</p>
                    </div>

                    <template v-if="company.user">
                        <div class="h-10 border-r border-base-300" />

                        <div class="flex items-center gap-2">
                            <UAvatar :src="company.user.photo ?? '/images/avatar-fallback.jpg'" />
                            <div>
                                <p class="font-semibold">{{ `${company.user.first_name} ${company.user.last_name}` }}</p>
                                <p class="text-xs">Owner</p>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </header>

        <section class="m-4 grid gap-4 md:grid-cols-12">
            <div class="flex flex-col gap-4 md:col-span-4">
                <UCard>
                    <template #header>
                        <h2 class="text-xl font-semibold">COMPANY</h2>
                    </template>

                    <div v-if="company" class="flex gap-6 text-sm sm:text-base">
                        <div class="text-weak grid shrink-0 grid-rows-11 gap-y-8">
                            <p>Company Name</p>
                            <p>Business Phone</p>
                            <p>Industry</p>
                            <p>Size</p>
                            <p>Country/Region</p>
                            <p>State/Province</p>
                            <p>City</p>
                            <p>Street 1</p>
                            <p>Street 2</p>
                            <p>Street 3</p>
                            <p>ZIP/Postal Code</p>
                        </div>

                        <UForm
                            ref="formRef"
                            :schema="updateCompanySchema"
                            :state="updateState"
                            class="grid grow grid-rows-11 gap-y-8 font-semibold"
                            :disabled="isUpdating"
                            @submit="updateCompany"
                            @error="console.error"
                        >
                            <UFormGroup name="name">
                                <UInput v-model="updateState.name" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="phone">
                                <UInput v-model="updateState.phone" variant="none" :padded="false" />
                            </UFormGroup>

                            <p class="line-clamp-1">{{ company.industry?.name ?? '---' }}</p>
                            <p class="line-clamp-1">
                                {{ company.size?.size_range ?? '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ company.country?.name ?? '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ company.province?.name ?? '---' }}
                            </p>
                            <p class="line-clamp-1">{{ company.city?.name ?? '---' }}</p>

                            <UFormGroup name="street_1">
                                <UInput v-model="updateState.street_1" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="street_2">
                                <UInput v-model="updateState.street_2" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="street_3">
                                <UInput v-model="updateState.street_3" variant="none" :padded="false" />
                            </UFormGroup>

                            <UFormGroup name="postal_code">
                                <UInput v-model="updateState.postal_code" variant="none" :padded="false" />
                            </UFormGroup>
                        </UForm>
                        <!-- <div class="grid grow grid-rows-11 gap-y-8 font-semibold">
                            <p class="line-clamp-1">{{ company.name }}</p>
                            <p class="line-clamp-1">{{ company.phone ?? '---' }}</p>
                            <p class="line-clamp-1">{{ company.industry?.name ?? '---' }}</p>
                            <p class="line-clamp-1">
                                {{ company.size?.size_range ?? '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ company.country?.name ?? '---' }}
                            </p>
                            <p class="line-clamp-1">
                                {{ company.province?.name ?? '---' }}
                            </p>
                            <p class="line-clamp-1">{{ company.city?.name ?? '---' }}</p>
                            <p class="line-clamp-1">{{ company.street_1 ?? '---' }}</p>
                            <p class="line-clamp-1">{{ company.street_2 ?? '---' }}</p>
                            <p class="line-clamp-1">{{ company.street_3 ?? '---' }}</p>
                            <p class="line-clamp-1">{{ company.postal_code ?? '---' }}</p>
                        </div> -->
                    </div>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">Primary Contact</h2>
                            <UButton
                                v-if="!!company?.primaryContact"
                                icon="i-heroicons-pencil"
                                variant="ghost"
                                square
                                color="black"
                                @click="
                                    modal.open(LazyModalEditCompanyPrimaryContact, {
                                        onClose: () => modal.close(),
                                        company: { id: company!.id },
                                        primaryContact: company.primaryContact,
                                    })
                                "
                            />
                        </div>
                    </template>

                    <div v-if="company?.primaryContact" class="rounded-lg border p-4">
                        <div class="flex items-center gap-4">
                            <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                            <div class="flex-1">
                                <p class="font-semibold text-brand">
                                    {{ `${company.primaryContact.first_name} ${company.primaryContact.last_name}` }}
                                </p>
                                <p class="text-xs">{{ company.primaryContact.job_title }}</p>
                            </div>
                            <UButton color="black" variant="ghost" icon="i-heroicons-envelope" square disabled />
                            <UButton color="black" variant="ghost" icon="i-heroicons-phone" square disabled />
                        </div>
                    </div>
                    <UButton
                        v-else
                        variant="outline"
                        icon="i-heroicons-plus"
                        size="xs"
                        @click="
                            modal.open(LazyModalAddCompanyPrimaryContact, {
                                onClose: () => modal.close(),
                                company: { id: company!.id },
                            })
                        "
                    >
                        Add Primary Contact
                    </UButton>

                    <div class="space-y-2">
                        <div class="mt-8 flex items-center justify-between">
                            <h3 class="text-xl font-semibold">Contacts</h3>
                            <UButton
                                variant="outline"
                                icon="i-heroicons-plus"
                                size="xs"
                                @click="
                                    modal.open(LazyModalAddCompanyContact, {
                                        onClose: () => modal.close(),
                                        company: { id: company!.id, name: company!.name },
                                    })
                                "
                                >Add Contact</UButton
                            >
                        </div>

                        <ul v-if="company?.contacts" class="space-y-4">
                            <li v-for="contact in company.contacts" :key="contact.id" class="flex items-center gap-4">
                                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                                <div>
                                    <p class="font-semibold">{{ `${contact.first_name} ${contact.last_name}` }}</p>
                                    <p class="text-xs">{{ contact.job_title }}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </UCard>
            </div>
        </section>
    </div>
</template>

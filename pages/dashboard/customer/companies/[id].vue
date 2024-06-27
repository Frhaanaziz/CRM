<script lang="ts" setup>
import LazyModalDeleteCompany from '~/components/modal/ModalDeleteCompany.vue';
import LazyModalAddCompanyContact from '~/components/modal/ModalAddCompanyContact.vue';
import LazyModalAddCompanyPrimaryContact from '~/components/modal/ModalAddCompanyPrimaryContact.vue';
import LazyModalEditCompanyPrimaryContact from '~/components/modal/ModalEditCompanyPrimaryContact.vue';
import LazyModalAssignCompany from '~/components/modal/ModalAssignCompany.vue';
import type { Contact } from '~/types';

const id = parseInt(useRoute().params.id as string);

const { data: company } = await useFetch(`/api/companies/${id}`, {
    key: `company-${id}`,
});
if (!company.value) throw createError({ status: 404, message: 'Company not found' });

const modal = useModal();
function openDeleteCompanyModal() {
    modal.open(LazyModalDeleteCompany, {
        onClose: () => modal.close(),
        companies: [{ id }],
    });
}
function openAssignCompanyModal() {
    modal.open(LazyModalAssignCompany, {
        onClose: () => modal.close(),
        company: { id: company.value!.id },
        userId: company.value!.user_id ?? undefined,
    });
}
function openAddContact() {
    modal.open(LazyModalAddCompanyContact, {
        onClose: () => modal.close(),
        company: { id: company.value!.id, name: company.value!.name },
    });
}
function openAddPrimaryContact() {
    modal.open(LazyModalAddCompanyPrimaryContact, {
        onClose: () => modal.close(),
        company: { id: company.value!.id },
    });
}
function openEditPrimaryContact(primaryContact: Pick<Contact, 'id'>) {
    modal.open(LazyModalEditCompanyPrimaryContact, {
        onClose: () => modal.close(),
        company: { id: company.value!.id },
        primaryContact,
    });
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
                    @click="openAssignCompanyModal"
                >
                    Assign
                </UButton>
                <UButton
                    variant="ghost"
                    icon="i-heroicons-trash"
                    color="black"
                    class="font-semibold"
                    @click="openDeleteCompanyModal"
                >
                    Delete
                </UButton>
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

                        <div class="grid grow grid-rows-11 gap-y-8 font-semibold">
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
                        </div>
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
                                @click="openEditPrimaryContact(company.primaryContact)"
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
                    <UButton v-else variant="outline" icon="i-heroicons-plus" size="xs" @click="openAddPrimaryContact">
                        Add Primary Contact
                    </UButton>

                    <div class="space-y-2">
                        <div class="mt-8 flex items-center justify-between">
                            <h3 class="text-xl font-semibold">Contacts</h3>
                            <UButton variant="outline" icon="i-heroicons-plus" size="xs" @click="openAddContact"
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

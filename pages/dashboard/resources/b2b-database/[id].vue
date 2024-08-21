<script setup lang="ts">
import LazyModalAddCompanyToCRM from '~/components/modal/ModalAddCompanyToCRM.vue';
import type { AccordionItem } from '#ui/types';
import { useTimeAgo } from '@vueuse/core';
import type { B2BCompany, B2BContact, City, CompanyOverview, Industry, Province, Size } from '~/types';

const modal = useModal();
const id = useRoute().params.id;

interface IB2BCompany extends B2BCompany {
    industry?: Industry | null;
    size?: Size | null;
    province?: Province | null;
    city?: City | null;
    contacts?: B2BContact[] | null;
}
const { data: companyData } = await useFetch<{ data: IB2BCompany; similar_companies: IB2BCompany[] }>(
    `/api/b2b-companies/${id}`,
    {
        key: `b2b-companies-${id}`,
        headers: useRequestHeaders(['cookie']),
    }
);
if (!companyData.value) throw createError({ status: 404, message: 'B2B Company not found' });

const company = ref(companyData.value?.data);
const similarCompanies = ref(companyData.value?.similar_companies);
const overviews = computed<CompanyOverview[]>(() => {
    const overviews: CompanyOverview[] = [];

    if (company.value?.description) {
        overviews.push({
            id: 0,
            title: 'Description',
            description: company.value.description,
            created_at: company.value.created_at,
            updated_at: company.value.updated_at,
            company_id: company.value.id,
        });
    }

    if (company.value?.specialities) {
        overviews.push({
            id: 1,
            title: 'Specialities',
            description: company.value.specialities,
            created_at: company.value.created_at,
            updated_at: company.value.updated_at,
            company_id: company.value.id,
        });
    }

    return overviews;
});

const accordionItems = computed(() =>
    company.value!.contacts?.map(
        (contact) =>
            ({
                content: contact.id.toString(),
                slot: contact.id.toString(),
            }) satisfies AccordionItem
    )
);
function getContact(id: string) {
    return company.value!.contacts?.find((contact) => contact.id === parseInt(id));
}
</script>

<template>
    <div v-if="company" class="min-h-screen bg-gray-50">
        <header class="sticky top-0 z-10 bg-base-100 shadow">
            <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-4">
                    <UAvatar :src="company.avatar ?? getFallbackAvatarUrl(company.name)" size="2xl" />
                    <div class="space-y-1">
                        <h1 class="text-xl font-bold">{{ company.name }}</h1>
                        <p v-if="company.location" class="flex items-center gap-1 text-sm text-slate-600">
                            <UIcon name="i-heroicons-map-pin" class="h-5 w-5" />
                            {{ company.location }}
                        </p>
                        <p class="flex items-center gap-1 text-sm text-slate-600">
                            <UIcon name="i-heroicons-clock" class="h-5 w-5" />
                            Last updated
                            {{ useTimeAgo(company.updated_at).value.replace('"', '') }}
                        </p>
                    </div>
                </div>

                <UButton
                    variant="outline"
                    icon="i-heroicons-plus"
                    :trailing="false"
                    class="hidden sm:flex"
                    @click="
                        modal.open(LazyModalAddCompanyToCRM, {
                            onClose: () => modal.close(),
                            b2b_company_id: company.id,
                        })
                    "
                >
                    Add to leads
                </UButton>
            </div>
        </header>

        <section class="grid gap-4 p-4 md:grid-cols-12">
            <div class="col-span-4 flex flex-col gap-4">
                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-slate-700">Company Information</h2>
                    </template>

                    <ul class="space-y-4">
                        <li class="grid grid-cols-12 items-center text-slate-700">
                            <p class="col-span-3 font-semibold">Industry</p>
                            <p class="col-span-9">{{ company.industry?.name ?? '---' }}</p>
                        </li>
                        <li class="grid grid-cols-12 items-center text-slate-700">
                            <p class="col-span-3 font-semibold">Size</p>
                            <p class="col-span-9">{{ company.size?.size_range ?? '---' }}</p>
                        </li>
                        <li class="grid grid-cols-12 items-center text-slate-700">
                            <p class="col-span-3 font-semibold">Website</p>
                            <p class="col-span-9 flex items-center justify-between gap-2">
                                <span class="truncate">
                                    {{ company.website ?? '---' }}
                                </span>
                                <NuxtLink v-if="company.website" :href="company.website" external target="_blank">
                                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5 text-brand" />
                                </NuxtLink>
                            </p>
                        </li>
                        <li class="grid grid-cols-12 items-center text-slate-700">
                            <p class="col-span-3 font-semibold">Linkedin</p>
                            <p class="col-span-9 flex items-center justify-between gap-2">
                                <span class="truncate">
                                    {{ company.linkedin ?? '---' }}
                                </span>
                                <NuxtLink v-if="company.linkedin" :href="company.linkedin" external target="_blank">
                                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5 text-brand" />
                                </NuxtLink>
                            </p>
                        </li>
                        <li class="grid grid-cols-12 items-center text-slate-700">
                            <p class="col-span-3 font-semibold">Address</p>
                            <p class="col-span-9">{{ company.location ?? '---' }}</p>
                        </li>
                        <li class="grid grid-cols-12 items-center text-slate-700">
                            <p class="col-span-3 font-semibold">ZIP Code</p>
                            <p class="col-span-9">{{ company.zip_code ?? '---' }}</p>
                        </li>
                    </ul>
                </UCard>

                <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <h2 class="font-semibold text-slate-700">Contacts</h2>
                    </template>

                    <UAccordion
                        variant="outline"
                        multiple
                        :items="accordionItems"
                        :ui="{
                            wrapper: 'w-full flex flex-col gap-2',
                            item: { base: 'border-b' },
                        }"
                    >
                        <template #default="{ item, open }">
                            <div
                                class="flex cursor-pointer items-center justify-between px-2 py-1 transition"
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
                                <UButton
                                    square
                                    icon="i-heroicons-chevron-down"
                                    variant="ghost"
                                    color="black"
                                    disabled
                                    class="transition"
                                    :class="{ 'rotate-180': open }"
                                />
                            </div>
                        </template>

                        <template v-for="b2b_contact in company.contacts" :key="b2b_contact.id" #[b2b_contact.id.toString()]>
                            <ul class="space-y-2 px-2">
                                <li class="grid grid-cols-12 items-center text-slate-700">
                                    <p class="col-span-4 font-semibold">Email</p>
                                    <p class="col-span-8">{{ b2b_contact.email ?? '---' }}</p>
                                </li>
                                <li class="grid grid-cols-12 items-center text-slate-700">
                                    <p class="col-span-4 font-semibold">LinkedIn</p>
                                    <p class="col-span-8 flex items-center justify-between gap-2">
                                        <span class="truncate">
                                            {{ b2b_contact.linkedin ?? '---' }}
                                        </span>
                                        <NuxtLink
                                            v-if="b2b_contact.linkedin"
                                            :href="b2b_contact.linkedin"
                                            external
                                            target="_blank"
                                        >
                                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5 text-brand" />
                                        </NuxtLink>
                                    </p>
                                </li>
                            </ul>
                        </template>
                    </UAccordion>
                </UCard>

                <!-- <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <h2 class="font-semibold text-slate-700">Contacts</h2>
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
                            <button
                                class="flex items-center justify-between gap-2 px-2 py-1 text-slate-700"
                                :class="{ '[&:not(:last-child)]:border-b': !open }"
                            >
                                <div>
                                    <p class="text-start font-semibold">
                                        {{ getUserFullName(getB2BContact(parseInt(item.content))) }}
                                    </p>
                                    <p v-if="getB2BContact(parseInt(item.content))?.job_title" class="text-start text-xs">
                                        {{ getB2BContact(parseInt(item.content))?.job_title }}
                                    </p>
                                </div>
                                <UIcon
                                    name="i-heroicons-chevron-up-solid"
                                    class="shrink-0 transition"
                                    :class="{ 'rotate-180': open }"
                                />
                            </button>
                        </template>

                        <template v-for="b2b_contact in company.contacts" :key="b2b_contact.id" #[b2b_contact.id.toString()]>
                            <ul class="space-y-2 px-2">
                                <li class="grid grid-cols-12 items-center text-slate-700">
                                    <p class="col-span-4 font-semibold">Mobile Phone</p>
                                    <p class="col-span-8">{{ company.phone ?? '---' }}</p>
                                </li>
                                <li class="grid grid-cols-12 items-center text-slate-700">
                                    <p class="col-span-4 font-semibold">Email</p>
                                    <p class="col-span-8">{{ company.email ?? '---' }}</p>
                                </li>
                                <li class="grid grid-cols-12 items-center text-slate-700">
                                    <p class="col-span-4 font-semibold">LinkedIn</p>
                                    <p class="col-span-8 flex items-center justify-between gap-2">
                                        <span class="truncate">
                                            {{ company.linkedin ?? '---' }}
                                        </span>
                                        <NuxtLink v-if="company.linkedin" :href="company.linkedin" external target="_blank">
                                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5 text-brand" />
                                        </NuxtLink>
                                    </p>
                                </li>
                            </ul>
                        </template>
                    </UAccordion>
                </UCard> -->
            </div>

            <div class="col-span-8">
                <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
                    <template #header>
                        <h2 class="font-semibold text-slate-700">Overviews</h2>
                    </template>

                    <ul class="divide-y">
                        <li
                            v-for="overview in overviews"
                            :key="overview.id"
                            class="border-l-4 border-l-brand p-2 text-sm text-gray-700"
                        >
                            <p class="font-semibold">{{ overview.title }}</p>
                            <p>{{ overview.description }}</p>
                        </li>
                    </ul>
                </UCard>
            </div>
        </section>

        <section v-if="similarCompanies" class="space-y-4 p-4">
            <h2 class="text-xl font-semibold">Similar Companies</h2>

            <ul class="grid grid-cols-3 gap-2">
                <li
                    v-for="similarCompany in similarCompanies"
                    :key="similarCompany.id"
                    class="flex items-center gap-4 rounded-lg border bg-base-100 p-4"
                >
                    <UAvatar :src="similarCompany.avatar ?? getFallbackAvatarUrl(similarCompany.name)" size="2xl" />
                    <div class="space-y-1">
                        <NuxtLink
                            :href="`/dashboard/resources/b2b-database/${similarCompany.id}`"
                            class="text-xl font-semibold text-brand"
                        >
                            {{ similarCompany.name }}
                        </NuxtLink>
                        <p v-if="similarCompany.industry" class="flex items-center gap-1 text-xs text-slate-700">
                            <UIcon name="i-heroicons-building-office" class="h-4 w-4 shrink-0" />
                            <span class="line-clamp-1 text-wrap">
                                {{ similarCompany.industry.name }}
                            </span>
                        </p>
                        <p v-if="similarCompany.size" class="flex items-center gap-1 text-xs text-slate-700">
                            <UIcon name="i-heroicons-user" class="h-4 w-4 shrink-0" />
                            {{ similarCompany.size.size_range }}
                        </p>
                    </div>
                </li>
            </ul>
        </section>
    </div>
</template>

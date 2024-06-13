<script setup lang="ts">
import LazyModalAddCompanyToCRM from '~/components/modal/ModalAddCompanyToCRM.vue';
import type { City, Company, Industry, Photo, Province, Size } from '~/types';

interface ICompany extends Company {
    industry: Pick<Industry, 'name'>;
    size: Pick<Size, 'size_range'>;
    province: Pick<Province, 'name'>;
    city: Pick<City, 'name'>;
    photos: Pick<Photo, 'file'>[];
}

const route = useRoute();
const company_id = route.params.company_id;

const { data: company } = await useAPI<ICompany>(`/api/companies/detail/${company_id}`, {
    key: `companies-${company_id}`,
});
if (!company.value) throw createError({ status: 404, message: 'Company not found' });

const modal = useModal();
function openAddToCRMModal() {
    modal.open(LazyModalAddCompanyToCRM, {
        onClose: () => modal.close(),
    });
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <header class="bg-base-100">
            <div class="border-b">
                <NuxtLink href="/dashboard/companies" class="inline-block border px-2 pt-2">
                    <UIcon name="i-heroicons-arrow-left" class="h-6 w-6" />
                </NuxtLink>
            </div>

            <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <UAvatar :src="company?.avatar ?? '/images/avatar-fallback.jpg'" size="lg" />
                    <div>
                        <h1 class="text-lg font-bold">{{ company?.name }}</h1>
                        <p class="text-default text-sm">
                            {{ company?.industry?.name }}
                        </p>
                    </div>
                </div>

                <UButton variant="outline" icon="i-heroicons-plus" :trailing="false" @click="openAddToCRMModal">
                    Add to CRM
                </UButton>
            </div>
        </header>

        <section class="grid grid-cols-2 gap-x-4 p-3">
            <UCard>
                <template #header>
                    <h2 class="text-xl font-semibold">OVERVIEW</h2>
                </template>

                <h3 class="font-semibold">Description</h3>
                <p class="mt-1 text-sm">
                    {{ company?.description }}
                </p>

                <h3 class="mt-5 font-semibold">Services</h3>
                <p class="mt-1 text-sm">
                    {{ company?.services }}
                </p>

                <h3 class="mt-5 font-semibold">Gallery</h3>
                <div class="mt-1 flex items-center gap-2">
                    <NuxtImg src="/images/company-gallery-1.svg" width="258" height="144" />
                    <NuxtImg src="/images/company-gallery-2.svg" width="258" height="144" />
                </div>
            </UCard>
            <UCard>
                <template #header>
                    <h2 class="text-xl font-semibold">DETAILS</h2>
                </template>

                <div class="flex gap-6">
                    <div class="text-weak grid shrink-0 grid-rows-11 gap-y-8">
                        <p>Company Name</p>
                        <p>Website</p>
                        <p>LinkedIn URL</p>
                        <p>Phone</p>
                        <p>Email</p>
                        <p>Industry</p>
                        <p>Size</p>
                        <p>Province</p>
                        <p>City</p>
                        <p>Street</p>
                        <p>ZIP/Postal Code</p>
                    </div>

                    <div class="text-default grid grow grid-rows-11 gap-y-8 font-semibold">
                        <p class="line-clamp-1">{{ company?.name }}</p>
                        <div class="flex items-center justify-between">
                            <template v-if="company?.website">
                                <NuxtLink
                                    :href="company?.website ?? '#'"
                                    class="text-brand hover:underline"
                                    external
                                    target="_blank"
                                >
                                    {{ company?.website }}
                                </NuxtLink>
                                <UIcon
                                    name="i-heroicons-arrow-top-right-on-square shrink-0"
                                    class="text-weak text-weak h-5 w-5"
                                />
                            </template>
                        </div>
                        <div class="flex items-center justify-between">
                            <template v-if="company?.linkedin">
                                <NuxtLink
                                    :href="company?.linkedin ?? '#'"
                                    class="line-clamp-1 text-brand hover:underline"
                                    external
                                    target="_blank"
                                >
                                    {{ company?.linkedin }}
                                </NuxtLink>
                                <UIcon
                                    name="i-heroicons-arrow-top-right-on-square"
                                    class="text-weak text-weak h-5 w-5 shrink-0"
                                />
                            </template>
                        </div>
                        <p class="line-clamp-1">{{ company?.phone }}</p>
                        <p class="line-clamp-1">{{ company?.email }}</p>
                        <p class="line-clamp-1">
                            {{ company?.industry?.name }}
                        </p>
                        <p class="line-clamp-1">
                            {{ company?.size?.size_range }}
                        </p>
                        <p class="line-clamp-1">
                            {{ company?.province?.name }}
                        </p>
                        <p class="line-clamp-1">{{ company?.city?.name }}</p>
                        <p class="line-clamp-1">{{ company?.street }}</p>
                        <p class="line-clamp-1">{{ company?.zip_code }}</p>
                    </div>
                </div>
            </UCard>
        </section>
    </div>
</template>

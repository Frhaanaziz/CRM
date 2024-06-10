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

const { data: company } = await useAPI<ICompany>(
    `/api/companies/detail/${company_id}`,
    {
        key: `companies-${company_id}`,
    }
);
if (!company.value)
    throw createError({ status: 404, message: 'Company not found' });

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
                <NuxtLink
                    href="/dashboard/companies"
                    class="border inline-block pt-2 px-2"
                >
                    <UIcon name="i-heroicons-arrow-left" class="w-6 h-6" />
                </NuxtLink>
            </div>

            <div class="p-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <UAvatar
                        :src="company?.avatar ?? '/images/avatar-fallback.jpg'"
                        size="lg"
                    />
                    <div>
                        <h1 class="font-bold text-lg">{{ company?.name }}</h1>
                        <p class="text-sm text-default">
                            {{ company?.industry?.name }}
                        </p>
                    </div>
                </div>

                <UButton
                    variant="outline"
                    icon="i-heroicons-plus"
                    :trailing="false"
                    @click="openAddToCRMModal"
                >
                    Add to CRM
                </UButton>
            </div>
        </header>

        <section class="p-3 grid grid-cols-2 gap-x-4">
            <UCard>
                <template #header>
                    <h2 class="font-semibold text-xl">OVERVIEW</h2>
                </template>

                <h3 class="font-semibold">Description</h3>
                <p class="text-sm mt-1">
                    {{ company?.description }}
                </p>

                <h3 class="font-semibold mt-5">Services</h3>
                <p class="text-sm mt-1">
                    {{ company?.services }}
                </p>

                <h3 class="font-semibold mt-5">Gallery</h3>
                <div class="mt-1 flex items-center gap-2">
                    <NuxtImg
                        src="/images/company-gallery-1.svg"
                        width="258"
                        height="144"
                    />
                    <NuxtImg
                        src="/images/company-gallery-2.svg"
                        width="258"
                        height="144"
                    />
                </div>
            </UCard>
            <UCard>
                <template #header>
                    <h2 class="font-semibold text-xl">DETAILS</h2>
                </template>

                <div class="flex gap-6">
                    <div class="text-weak grid grid-rows-11 gap-y-8 shrink-0">
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

                    <div
                        class="text-default font-semibold grow grid grid-rows-11 gap-y-8"
                    >
                        <p class="line-clamp-1">{{ company?.name }}</p>
                        <div class="flex justify-between items-center">
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
                                    class="w-5 text-weak h-5 text-weak"
                                />
                            </template>
                        </div>
                        <div class="flex justify-between items-center">
                            <template v-if="company?.linkedin">
                                <NuxtLink
                                    :href="company?.linkedin ?? '#'"
                                    class="text-brand hover:underline line-clamp-1"
                                    external
                                    target="_blank"
                                >
                                    {{ company?.linkedin }}
                                </NuxtLink>
                                <UIcon
                                    name="i-heroicons-arrow-top-right-on-square"
                                    class="w-5 text-weak h-5 text-weak shrink-0"
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

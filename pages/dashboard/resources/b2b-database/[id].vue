<script setup lang="ts">
import LazyModalAddCompanyToCRM from '~/components/modal/ModalAddCompanyToCRM.vue';
import type { B2BCompany, City, Industry, Province, Size } from '~/types';

interface IB2BCompany extends B2BCompany {
    industry: Pick<Industry, 'name'>;
    size: Pick<Size, 'size_range'>;
    province: Pick<Province, 'name'>;
    city: Pick<City, 'name'>;
}

const id = useRoute().params.id;
const { data: company } = await useFetch<IB2BCompany>(`/api/b2b-companies/${id}`);
if (!company.value) throw createError({ status: 404, message: 'B2B Company not found' });

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
                <NuxtLink href="/dashboard/resources/b2b-database" class="flex h-10 w-10 items-center justify-center border">
                    <UIcon name="i-heroicons-arrow-left-20-solid" class="h-[18px] w-[18px]" />
                </NuxtLink>
            </div>

            <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <UAvatar :src="company?.avatar ?? '/images/avatar-fallback.jpg'" size="lg" />
                    <div>
                        <h1 class="text-lg font-bold">{{ company?.name }}</h1>
                        <p class="text-sm">
                            {{ company?.industry?.name }}
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

                <div class="flex gap-6 text-sm sm:text-base">
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

                    <div class="grid grow grid-rows-11 gap-y-8 font-semibold">
                        <p class="line-clamp-1">{{ company?.name }}</p>
                        <NuxtLink
                            :href="company?.website ?? '#'"
                            class="line-clamp-1 text-brand hover:underline"
                            external
                            target="_blank"
                        >
                            {{ company?.website }}
                        </NuxtLink>
                        <NuxtLink
                            :href="company?.linkedin ?? '#'"
                            class="line-clamp-1 text-brand hover:underline"
                            external
                            target="_blank"
                        >
                            {{ company?.linkedin }}
                        </NuxtLink>
                        <!-- <div class="flex items-center justify-between">
                           <NuxtLink
                                :href="company?.linkedin ?? '#'"
                                class="line-clamp-1 text-brand hover:underline"
                                external
                                target="_blank"
                            >
                                {{ company?.linkedin }}
                            </NuxtLink>
                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="text-weak text-weak h-5 w-5 shrink-0" /> 
                        </div> -->
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

<script lang="ts" setup>
import LazyModalDeleteCompany from '~/components/modal/ModalDeleteCompany.vue';

const id = parseInt(useRoute().params.id as string);

const { data: company } = useFetch(`/api/companies/${id}`, {
    key: `company-${id}`,
});
// if (!company.value) throw createError({ status: 404, message: 'Company not found' });

const modal = useModal();
function openDeleteCompanyModal() {
    modal.open(LazyModalDeleteCompany, {
        onClose: () => modal.close(),
        companies: [{ id }],
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
                <UButton variant="ghost" icon="i-heroicons-user" color="black" class="font-semibold" disabled>Assign</UButton>
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

                    <UDivider orientation="vertical" size="lg" />

                    <div class="flex items-center gap-2">
                        <UAvatar src="/images/avatar-fallback.jpg" />
                        <div>
                            <p class="font-semibold">John Doe</p>
                            <p class="text-xs">Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <section class="m-4 grid gap-4 md:grid-cols-2">
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
                        <p class="line-clamp-1">{{ company.phone }}</p>
                        <p class="line-clamp-1">{{ company.industry?.name }}</p>
                        <p class="line-clamp-1">
                            {{ company.size?.size_range }}
                        </p>
                        <p class="line-clamp-1">
                            {{ company.country?.name }}
                        </p>
                        <p class="line-clamp-1">
                            {{ company.province?.name }}
                        </p>
                        <p class="line-clamp-1">{{ company.city?.name }}</p>
                        <p class="line-clamp-1">{{ company.street_1 ?? '---' }}</p>
                        <p class="line-clamp-1">{{ company.street_2 ?? '---' }}</p>
                        <p class="line-clamp-1">{{ company.street_3 ?? '---' }}</p>
                        <p class="line-clamp-1">{{ company.postal_code }}</p>
                    </div>
                </div>
            </UCard>
        </section>
    </div>
</template>

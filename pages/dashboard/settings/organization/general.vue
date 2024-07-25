<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const { user } = storeToRefs(userSessionStore());
if (!user.value) throw createError({ status: 401, message: 'User is not authenticated' });

const { data, status } = await useLazyAsyncData(
    () => {
        return Promise.all([
            $fetch(`/api/users/${user.value?.id}/organization`),
            $fetch('/api/industries'),
            $fetch('/api/sizes'),
            $fetch('/api/countries'),
            $fetch('/api/provinces'),
            $fetch('/api/cities'),
        ]);
    },
    {
        default: () => [undefined, [], [], [], [], []] as const,
    }
);
const organization = computed(() => data.value[0]);
const industries = computed(() => data.value[1]);
const sizes = computed(() => data.value[2]);
const countries = computed(() => data.value[3]);
const provinces = computed(() => data.value[4]);
const cities = computed(() => data.value[5]);

const isSubmitting = ref(false);

const { state, stateRef } = useOrganization();
const { industriesOption, sizesOption, provincesOption, citiesOption, countriesOption } = useOptionsData();

type UpdateOrganizationType = z.infer<typeof updateOrganizationSchema>;
async function handleSubmit(event: FormSubmitEvent<UpdateOrganizationType>) {
    try {
        isSubmitting.value = true;
        await $fetch(`/api/organizations/${organization.value?.id}`, {
            method: 'PUT',
            body: JSON.stringify(event.data),
        });

        toast.success('Organization updated successfully');
    } catch (e) {
        console.error('Failed to update organization', e);
        toast.error('Failed to update organization');
    } finally {
        isSubmitting.value = false;
    }
}

function useOrganization() {
    const state = computed(() => ({
        id: organization.value?.id,
        name: organization.value?.name,
        city_id: organization.value?.city_id ?? undefined,
        size_id: organization.value?.size_id ?? undefined,
        website: organization.value?.website,
        country_id: organization.value?.country_id ?? undefined,
        description: organization.value?.description ?? undefined,
        industry_id: organization.value?.industry_id ?? undefined,
        province_id: organization.value?.province_id ?? undefined,
    }));
    const stateRef = ref(state.value);
    watchEffect(() => {
        stateRef.value = state.value;
    });

    return { state, stateRef };
}
function useOptionsData() {
    const industriesOption = computed(() =>
        industries.value?.map((industry) => ({
            id: industry.id,
            name: industry.name,
        }))
    );
    const sizesOption = computed(() =>
        sizes.value?.map((size) => ({
            id: size.id,
            size_range: size.size_range,
        }))
    );
    const provincesOption = computed(() =>
        provinces.value?.map((province) => ({
            id: province.id,
            name: province.name,
        }))
    );
    const citiesOption = computed(() =>
        cities.value?.map((city) => ({
            id: city.id,
            name: city.name,
        }))
    );
    const countriesOption = computed(() =>
        countries.value?.map((country) => ({
            id: country.id,
            name: country.name,
        }))
    );

    return {
        industriesOption,
        sizesOption,
        provincesOption,
        citiesOption,
        countriesOption,
    };
}
</script>

<template>
    <div>
        <h1 class="p-7 text-2xl font-semibold">General</h1>
        <section class="max-w-screen-sm p-7">
            <UForm
                v-if="!(status === 'pending')"
                :schema="updateOrganizationSchema"
                :state="state"
                class="mt-6 space-y-3"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Organization Name" name="name" required>
                    <UInput
                        v-model="stateRef.name"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your organization name"
                    />
                </UFormGroup>

                <UFormGroup label="Website" name="website" required>
                    <UInput
                        v-model="stateRef.website"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your organization website"
                    />
                </UFormGroup>

                <UFormGroup label="Industry" name="industry_id">
                    <USelectMenu
                        v-model="stateRef.industry_id"
                        value-attribute="id"
                        option-attribute="name"
                        :options="industriesOption"
                        placeholder="Select your industry"
                        searchable
                        searchable-placeholder="Search a industry..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="Size" name="size_id">
                    <USelectMenu
                        v-model="stateRef.size_id"
                        value-attribute="id"
                        option-attribute="size_range"
                        :options="sizesOption"
                        placeholder="Select your organization size"
                        searchable
                        searchable-placeholder="Search a size range..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="Country/Region" name="country_id">
                    <USelectMenu
                        v-model="stateRef.country_id"
                        value-attribute="id"
                        option-attribute="name"
                        :options="countriesOption"
                        placeholder="Select your country"
                        searchable
                        searchable-placeholder="Search a country..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="State/Province" name="province_id">
                    <USelectMenu
                        v-model="stateRef.province_id"
                        value-attribute="id"
                        option-attribute="name"
                        :options="provincesOption"
                        placeholder="Select your province"
                        searchable
                        searchable-placeholder="Search a province..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="City" name="city_id">
                    <USelectMenu
                        v-model="stateRef.city_id"
                        value-attribute="id"
                        option-attribute="name"
                        :options="citiesOption"
                        placeholder="Select your city"
                        searchable
                        searchable-placeholder="Search a city..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                    />
                </UFormGroup>

                <UFormGroup label="Description" name="description">
                    <UTextarea
                        v-model="stateRef.description"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                        placeholder="Enter your organization description"
                    />
                </UFormGroup>

                <UButton type="submit" size="md" :disabled="isSubmitting" :loading="isSubmitting"> Save </UButton>
            </UForm>
            <div v-else class="mt-6 space-y-3">
                <div v-for="(_, index) in Array.from({ length: 7 })" :key="index" class="flex flex-col gap-1">
                    <USkeleton class="h-5 w-32" />
                    <USkeleton class="h-8 w-[584px]" />
                </div>
                <div class="flex flex-col gap-1">
                    <USkeleton class="h-5 w-32" />
                    <USkeleton class="h-[72px] w-[584px]" />
                </div>

                <USkeleton class="h-9 w-14" />
            </div>
        </section>
    </div>
</template>

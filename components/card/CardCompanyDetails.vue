<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { useRefHistory } from '@vueuse/core';
import type { z } from 'zod';
import type { City, Company, Country, Industry, Province, Size } from '~/types';

const props = defineProps<{
    company: Company & {
        industry: Pick<Industry, 'id'> | null;
        size: Pick<Size, 'id'> | null;
        province: Pick<Province, 'id'> | null;
        city: Pick<City, 'id'> | null;
        country: Pick<Country, 'id'> | null;
    };
}>();
const { company } = toRefs(props);

const { updateState, isUpdating, updateCompany, formRef, submitForm, isFormDirty, resetForm } = useUpdateB2BCompany();
defineExpose({ submitForm, resetForm, isFormDirty, isUpdating });

onBeforeRouteLeave(() => {
    if (isFormDirty.value) {
        return window.confirm('Are you sure you want to leave?, you have unsaved changes.');
    }
});

const { data } = await useLazyAsyncData(
    () => {
        const headers = useRequestHeaders(['cookie']);
        return Promise.all([
            $fetch('/api/industries', { headers }),
            $fetch('/api/sizes', { headers }),
            $fetch('/api/countries', { headers }),
            $fetch('/api/provinces', { headers }),
            $fetch('/api/cities', { headers }),
        ]);
    },
    {
        transform: ([industries, sizes, countries, provinces, cities]) => [
            industries.map(({ id, name }) => ({ value: id, label: name })),
            sizes.map(({ id, size_range }) => ({ value: id, label: size_range })),
            countries.map(({ id, name }) => ({ value: id, label: name })),
            provinces.map(({ id, name }) => ({ value: id, label: name })),
            cities.map(({ id, name }) => ({ value: id, label: name })),
        ],
        default: () => [[], [], [], [], []],
    }
);
const industriesOption = computed(() => data.value[0]);
const sizesOption = computed(() => data.value[1]);
const countriesOption = computed(() => data.value[2]);
const provincesOption = computed(() => data.value[3]);
const citiesOption = computed(() => data.value[4]);

function useUpdateB2BCompany() {
    type UpdateB2BCompanyType = z.infer<typeof updateCompanySchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        id: company.value.id,
        name: company.value.name,
        phone: company.value.phone || undefined,
        industry_id: company.value.industry?.id || undefined,
        size_id: company.value.size?.id || undefined,
        country_id: company.value.country?.id || undefined,
        province_id: company.value.province?.id || undefined,
        city_id: company.value.city?.id || undefined,
        street_1: company.value.street_1 || undefined,
        street_2: company.value.street_2 || undefined,
        street_3: company.value.street_3 || undefined,
        postal_code: company.value.postal_code || undefined,
        website: company.value.website || undefined,
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

    async function updateCompany(event: FormSubmitEvent<UpdateB2BCompanyType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/companies/${company.value.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Company updated successfully.');
            clear();
            await refreshNuxtData();
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
    <UCard>
        <template #header>
            <h2 class="text-xl font-semibold">COMPANY</h2>
        </template>

        <div class="flex gap-6 text-sm sm:text-base">
            <div class="text-weak grid shrink-0 grid-rows-12 gap-y-8">
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
                <p>Website</p>
            </div>

            <UForm
                ref="formRef"
                :schema="updateCompanySchema"
                :state="updateState"
                class="grid grow grid-rows-12 gap-y-6 font-semibold"
                :disabled="isUpdating"
                @submit="updateCompany"
                @error="console.error"
            >
                <UFormGroup name="name">
                    <UInput
                        v-model="updateState.name"
                        placeholder="---"
                        :disabled="isUpdating"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </UFormGroup>

                <UFormGroup name="phone">
                    <UInput
                        v-model="updateState.phone"
                        placeholder="---"
                        :disabled="isUpdating"
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
                        :options="industriesOption ?? []"
                        placeholder="---"
                        :disabled="isUpdating"
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
                        :options="sizesOption ?? []"
                        placeholder="---"
                        :disabled="isUpdating"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </UFormGroup>

                <UFormGroup name="country_id">
                    <USelectMenu
                        v-model="updateState.country_id"
                        value-attribute="value"
                        :options="countriesOption ?? []"
                        placeholder="---"
                        :disabled="isUpdating"
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
                        :options="provincesOption ?? []"
                        searchable
                        searchable-placeholder="Search a provinces..."
                        placeholder="---"
                        :disabled="isUpdating"
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
                        :options="citiesOption ?? []"
                        searchable
                        searchable-placeholder="Search a cities..."
                        placeholder="---"
                        :disabled="isUpdating"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </UFormGroup>

                <UFormGroup name="street_1">
                    <UInput
                        v-model="updateState.street_1"
                        placeholder="---"
                        :disabled="isUpdating"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </UFormGroup>

                <UFormGroup name="street_2">
                    <UInput
                        v-model="updateState.street_2"
                        placeholder="---"
                        :disabled="isUpdating"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </UFormGroup>

                <UFormGroup name="street_3">
                    <UInput
                        v-model="updateState.street_3"
                        placeholder="---"
                        :disabled="isUpdating"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </UFormGroup>

                <UFormGroup name="postal_code">
                    <UInput
                        v-model="updateState.postal_code"
                        placeholder="---"
                        :disabled="isUpdating"
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
                            :disabled="isUpdating"
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
            </UForm>
        </div>
    </UCard>
</template>

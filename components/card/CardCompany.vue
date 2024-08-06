<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { useRefHistory } from '@vueuse/core';
import type { z } from 'zod';
import type { Company, Industry, Size } from '~/types';

const props = defineProps<{
    company: Company & {
        industry?: Pick<Industry, 'id'> | null;
        size?: Pick<Size, 'id'> | null;
    };
}>();
const { company } = toRefs(props);

const { updateState, isUpdating, updateCompany, formRef, submitForm, isFormDirty, resetForm } = useUpdateCompany();
defineExpose({ submitForm, resetForm, isFormDirty, isUpdating });
onBeforeRouteLeave(() => {
    if (isFormDirty.value) {
        return window.confirm('Are you sure you want to leave?, you have unsaved changes.');
    }
});

const { data } = await useLazyAsyncData(
    () => {
        const headers = useRequestHeaders(['cookie']);
        return Promise.all([$fetch('/api/industries', { headers }), $fetch('/api/sizes', { headers })]);
    },
    {
        transform: ([industries, sizes]) => [
            industries.map(({ id, name }) => ({ value: id, label: name })),
            sizes.map(({ id, size_range }) => ({ value: id, label: size_range })),
        ],
        default: () => [[], []],
    }
);
const industriesOption = computed(() => data.value[0]);
const sizesOption = computed(() => data.value[1]);

function useUpdateCompany() {
    type UpdateB2BCompanyType = z.infer<typeof updateCompanySchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        name: company.value.name,
        industry_id: company.value.industry?.id || undefined,
        size_id: company.value.size?.id || undefined,
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
            <h2 class="font-semibold text-slate-700">Company Information</h2>
        </template>

        <UForm
            ref="formRef"
            :schema="updateCompanySchema"
            :state="updateState"
            class="col-span-8 space-y-2"
            :disabled="isUpdating"
            @submit="updateCompany"
            @error="console.error"
        >
            <UFormGroup name="name">
                <div class="grid grid-cols-4 items-center">
                    <p class="text-start font-semibold">Name</p>
                    <UInput
                        v-model="updateState.name"
                        placeholder="---"
                        :disabled="isUpdating"
                        class="col-span-3"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </div>
            </UFormGroup>

            <UFormGroup name="industry_id">
                <div class="grid grid-cols-4 items-center">
                    <p class="text-start font-semibold">Industry</p>
                    <USelectMenu
                        v-model="updateState.industry_id"
                        value-attribute="value"
                        :options="industriesOption ?? []"
                        searchable
                        searchable-placeholder="Search a industry..."
                        placeholder="---"
                        :disabled="isUpdating"
                        class="col-span-3"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </div>
            </UFormGroup>

            <UFormGroup name="size_id">
                <div class="grid grid-cols-4 items-center">
                    <p class="text-start font-semibold">Size</p>
                    <USelectMenu
                        v-model="updateState.size_id"
                        value-attribute="value"
                        :options="sizesOption ?? []"
                        placeholder="---"
                        :disabled="isUpdating"
                        class="col-span-3"
                        :ui="{
                            color: {
                                white: {
                                    outline: 'ring-0 shadow-none hover:ring-1 ',
                                },
                            },
                        }"
                    />
                </div>
            </UFormGroup>

            <UFormGroup name="website">
                <div class="flex items-center justify-between gap-2">
                    <div class="grid flex-1 grid-cols-4 items-center">
                        <p class="text-start font-semibold">Website</p>
                        <UInput
                            v-model="updateState.website"
                            placeholder="---"
                            :disabled="isUpdating"
                            class="col-span-3"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1',
                                    },
                                },
                            }"
                        />
                    </div>
                    <NuxtLink v-if="company.website" :href="company.website" target="_blank" external class="grid content-center">
                        <UIcon name="i-heroicons-arrow-top-right-on-square" color="black" class="h-5 w-5 text-brand" />
                    </NuxtLink>
                </div>
            </UFormGroup>
        </UForm>
        <!-- </div> -->
    </UCard>
</template>

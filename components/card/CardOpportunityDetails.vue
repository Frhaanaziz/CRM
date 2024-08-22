<script lang="ts" setup>
import { useDateFormat, useRefHistory } from '@vueuse/core';
import type { z } from 'zod';
import type { Contact, Currency, Opportunity } from '~/types';
import type { FormSubmitEvent } from '#ui/types';

interface IOpportunity extends Opportunity {
    contact?: Pick<Contact, 'first_name' | 'last_name' | 'id'> | null;
    currency?: Pick<Currency, 'name'> | null;
}
const props = defineProps<{
    opportunity: IOpportunity;
}>();
const { opportunity } = toRefs(props);

const { updateState, isUpdating, updateOpportunity, formRef, submitForm, isFormDirty, resetForm } = useUpdateOpportunity();
defineExpose({ submitForm, resetForm, isFormDirty, isUpdating });

const { data: currenciesOption } = await useLazyFetch('/api/currencies', {
    headers: useRequestHeaders(['cookie']),
    transform: (currencies) => currencies.map((currency) => ({ label: currency.name, value: currency.id })),
    default: () => [],
});

onBeforeRouteLeave(() => {
    if (isFormDirty.value) {
        return window.confirm('Are you sure you want to leave?, you have unsaved changes.');
    }
});

function useUpdateOpportunity() {
    type UpdateOpportunityType = z.infer<typeof updateOpportunitySchema>;
    const formRef = ref();
    const isUpdating = ref(false);

    const initialState = {
        act_close_date: opportunity.value!.act_close_date
            ? useDateFormat(opportunity.value!.act_close_date, 'YYYY-MM-DD').value.replace('"', '')
            : undefined,
        currency_id: opportunity.value!.currency_id ?? undefined,
        act_budget: opportunity.value!.act_budget ?? undefined,
        est_revenue: opportunity.value!.est_revenue ?? undefined,
        payment_plan: opportunity.value!.payment_plan ?? undefined,
        confidence: opportunity.value!.confidence ?? undefined,
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

    async function updateOpportunity(event: FormSubmitEvent<UpdateOpportunityType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/opportunities/${opportunity.value.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...event.data,
                    act_close_date: event.data.act_close_date && new Date(event.data.act_close_date),
                }),
            });

            toast.success('Opportunity updated successfully.');
            clear();
            await refreshNuxtData(`opportunities-${opportunity.value.id}`);
        } catch (e) {
            console.error('Failed to update opportunity', e);
            toast.error('Failed to update opportunity, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { updateState, isUpdating, updateOpportunity, formRef, submitForm: submit, isFormDirty: isDirty, resetForm };
}
</script>

<template>
    <UCard>
        <template #header>
            <h2 class="font-semibold text-slate-700">Opportunity Information</h2>
        </template>

        <UForm
            v-if="opportunity"
            ref="formRef"
            :schema="updateOpportunitySchema"
            :state="updateState"
            :disabled="isUpdating"
            @submit="updateOpportunity"
            @error="console.error"
        >
            <ul class="grid grid-cols-1 gap-2 text-slate-700">
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Contact</p>
                    <NuxtLink
                        v-if="opportunity.contact"
                        :href="`/dashboard/customer/contacts/${opportunity.contact.id}`"
                        class="col-span-8 ml-3 line-clamp-1 text-brand"
                    >
                        {{ getUserFullName(opportunity.contact) }}
                    </NuxtLink>
                    <p v-else class="col-span-8 ml-3">---</p>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Act. Close Date</p>
                    <UFormGroup name="act_close_date" class="col-span-8">
                        <UInput
                            v-model="updateState.act_close_date"
                            type="date"
                            :disabled="isUpdating"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Act. Budget</p>
                    <UFormGroup name="act_budget" class="col-span-8">
                        <UInput
                            v-model.number="updateState.act_budget"
                            type="number"
                            inputmode="numeric"
                            min="0"
                            :disabled="isUpdating"
                            :ui="{
                                form: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1',
                                    },
                                },
                            }"
                        >
                            <template #leading>
                                <span class="text-sm"> Rp </span>
                            </template>
                        </UInput>
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Est. Revenue</p>
                    <UFormGroup name="est_revenue" class="col-span-8">
                        <UInput
                            v-model.number="updateState.est_revenue"
                            type="number"
                            inputmode="numeric"
                            min="0"
                            :disabled="isUpdating"
                            :ui="{
                                form: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1',
                                    },
                                },
                            }"
                        >
                            <template #leading>
                                <span class="text-sm"> Rp </span>
                            </template>
                        </UInput>
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Confidence</p>
                    <UFormGroup name="confidence" class="col-span-8">
                        <UInput
                            v-model.number="updateState.confidence"
                            type="number"
                            min="0"
                            max="100"
                            :disabled="isUpdating"
                            placeholder="---"
                            :ui="{
                                form: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1  ',
                                    },
                                },
                            }"
                        >
                            <template #trailing>
                                <span class="text-sm"> % </span>
                            </template>
                        </UInput>
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Payment Plan</p>
                    <UFormGroup name="payment_plan_id" class="col-span-8">
                        <USelectMenu
                            v-model="updateState.payment_plan"
                            :options="[...opportunityPaymentPlans]"
                            :disabled="isUpdating"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
                <li class="grid grid-cols-12 items-center gap-4">
                    <p class="col-span-4 font-semibold">Currency</p>
                    <UFormGroup name="currency_id" class="col-span-8">
                        <USelectMenu
                            v-model="updateState.currency_id"
                            value-attribute="value"
                            :options="currenciesOption ?? []"
                            :disabled="isUpdating"
                            placeholder="---"
                            :ui="{
                                color: {
                                    white: {
                                        outline: 'ring-0 shadow-none hover:ring-1',
                                    },
                                },
                            }"
                        />
                    </UFormGroup>
                </li>
            </ul>
        </UForm>
    </UCard>
</template>

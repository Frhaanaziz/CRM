<script lang="ts" setup>
import { useDateFormat, useRefHistory } from '@vueuse/core';
import type { z } from 'zod';
import type { Company, Contact, Currency, Opportunity, PaymentPlan } from '~/types';
import type { FormSubmitEvent } from '#ui/types';

interface IOpportunity extends Opportunity {
    company: Pick<Company, 'name' | 'id'> | null;
    contact: Pick<Contact, 'first_name' | 'last_name' | 'id'> | null;
    currency: Pick<Currency, 'name'> | null;
    payment_plan: Pick<PaymentPlan, 'name'> | null;
}
const props = defineProps<{
    opportunity: IOpportunity;
}>();
const { opportunity } = toRefs(props);

const { updateState, isUpdating, updateOpportunity, formRef, submitForm, isFormDirty, resetForm } = useUpdateOpportunity();
defineExpose({ submitForm, resetForm, isFormDirty, isUpdating });

const { data } = await useLazyAsyncData(() => Promise.all([$fetch('/api/payment-plans'), $fetch('/api/currencies')]), {
    transform: ([plans, currencies]) => [
        plans.map((plan) => ({ label: capitalize(plan.name), value: plan.id })),
        currencies.map((currency) => ({ label: currency.name, value: currency.id })),
    ],
    default: () => [[], []],
});
const paymentPlansOption = computed(() => data.value[0]);
const currenciesOption = computed(() => data.value[1]);

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
        id: opportunity.value!.id,
        act_close_date: opportunity.value!.act_close_date
            ? useDateFormat(opportunity.value!.act_close_date, 'YYYY-MM-DD').value.replace('"', '')
            : undefined,
        currency_id: opportunity.value!.currency_id ?? undefined,
        act_budget: opportunity.value!.act_budget ?? undefined,
        est_revenue: opportunity.value!.est_revenue ?? undefined,
        payment_plan_id: opportunity.value!.payment_plan_id ?? undefined,
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
            <h2 class="text-xl font-semibold">OPPORTUNITY</h2>
        </template>

        <div v-if="opportunity" class="flex gap-6 text-sm sm:text-base">
            <div class="text-weak grid shrink-0 grid-rows-8 gap-y-8">
                <p>Company</p>
                <p>Contact</p>
                <p>Est. Close Date</p>
                <p>Currency</p>
                <p>Budget Amount</p>
                <p>Est. Revenue</p>
                <p>Payment Plans</p>
                <p>Confidence</p>
            </div>

            <UForm
                ref="formRef"
                :schema="updateOpportunitySchema"
                :state="updateState"
                class="grid grow grid-rows-8 gap-y-6 font-semibold"
                :disabled="isUpdating"
                @submit="updateOpportunity"
                @error="console.error"
            >
                <NuxtLink
                    v-if="opportunity.company"
                    :href="`/dashboard/customer/companies/${opportunity.company.id}`"
                    class="ml-4 line-clamp-1 text-brand"
                >
                    {{ opportunity.company.name }}
                </NuxtLink>
                <p v-else class="ml-4">---</p>

                <NuxtLink
                    v-if="opportunity.contact"
                    :href="`/dashboard/customer/contacts/${opportunity.contact.id}`"
                    class="ml-4 line-clamp-1 text-brand"
                >
                    {{ getUserFullName(opportunity.contact) }}
                </NuxtLink>
                <p v-else class="ml-4">---</p>

                <UFormGroup name="act_close_date" required>
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
                <UFormGroup name="currency_id">
                    <USelectMenu
                        v-model="updateState.currency_id"
                        value-attribute="value"
                        option-attribute="label"
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
                <UFormGroup name="act_budget">
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
                <UFormGroup name="est_revenue">
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
                <UFormGroup name="payment_plan_id">
                    <USelectMenu
                        v-model="updateState.payment_plan_id"
                        value-attribute="value"
                        option-attribute="label"
                        :options="paymentPlansOption ?? []"
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
                <UFormGroup name="confidence">
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
            </UForm>
        </div>
    </UCard>
</template>

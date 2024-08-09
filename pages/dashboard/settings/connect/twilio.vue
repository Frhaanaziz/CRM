<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const tabItems = [
    {
        label: 'Settings',
        icon: 'i-heroicons-phone',
        slot: 'settings',
    },
    {
        label: 'Agent',
        icon: 'i-heroicons-briefcase',
        slot: 'agent',
    },
];
const selectedTab = ref(tabItems[0]);

const { user } = storeToRefs(userSessionStore());
if (!user.value) throw createError({ status: 401, message: 'Unauthorized' });

const { data } = await useAsyncData(async () => {
    return Promise.all([
        $fetch(`/api/twilio-settings/${user.value?.user_metadata.twilio_setting_id}`, {
            headers: useRequestHeaders(['cookie']),
        }),
        $fetch(`/api/twilio-agents/${user.value?.user_metadata.twilio_agent_id}`, {
            headers: useRequestHeaders(['cookie']),
        }),
    ]);
});
const twilioSetting = ref(data.value ? data.value[0] : null);
const twilioAgent = ref(data.value ? data.value[1] : null);

const { isUpdatingSetting, settingState, updateSetting } = useUpdateSetting();
const { isUpdatingAgent, agentState, updateAgent } = useUpdateAgent();

function useUpdateSetting() {
    type UpdateTwilioSettingType = z.infer<typeof updateTwilioSettingSchema>;
    const isUpdating = ref(false);
    const settingState = ref({
        id: twilioSetting.value?.id,
        account_sid: twilioSetting.value?.account_sid ?? undefined,
        api_key: twilioSetting.value?.api_key ?? undefined,
        api_secret: twilioSetting.value?.api_secret ?? undefined,
        auth_token: twilioSetting.value?.auth_token ?? undefined,
        enabled: twilioSetting.value?.enabled ?? true,
        record_calls: twilioSetting.value?.record_calls ?? false,
        twiml_sid: twilioSetting.value?.twiml_sid ?? undefined,
    });

    async function handleSubmit(event: FormSubmitEvent<UpdateTwilioSettingType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/twilio-settings/${twilioSetting.value?.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Twilio setting updated successfully.');
            await refreshNuxtData('twilio-setting');
        } catch (e) {
            console.error('Failed to update Twilio setting', e);
            toast.error('Failed to update Twilio setting, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return {
        isUpdatingSetting: isUpdating,
        settingState,
        updateSetting: handleSubmit,
    };
}

function useUpdateAgent() {
    type UpdateTwilioAgentType = z.infer<typeof updateTwilioAgentSchema>;
    const isUpdating = ref(false);
    const agentState = ref({
        id: twilioSetting.value?.id,
        call_receiving_device: twilioAgent.value?.call_receiving_device ?? undefined,
        twilio_number: twilioAgent.value?.twilio_number ?? undefined,
    });

    async function handleSubmit(event: FormSubmitEvent<UpdateTwilioAgentType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/twilio-agents/${twilioSetting.value?.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Twilio agent updated successfully.');
            await refreshNuxtData('twilio-agent');
        } catch (e) {
            console.error('Failed to update Twilio agent', e);
            toast.error(getErrorMessage(e) || 'Failed to update Twilio agent, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return {
        isUpdatingAgent: isUpdating,
        agentState,
        updateAgent: handleSubmit,
    };
}
</script>

<template>
    <div class="p-7">
        <header class="mb-7 flex items-center justify-between">
            <h1 class="text-2xl font-semibold">Twilio Integration</h1>
            <UTabs :items="tabItems" @change="(index) => (selectedTab = tabItems[index])">
                <template #default="{ item, selected }">
                    <span class="flex items-center gap-1 truncate" :class="[selected && 'text-brand-500 dark:text-brand-400']">
                        <UIcon :name="item.icon" class="h-4 w-4" /> {{ item.label }}
                    </span>
                </template>
            </UTabs>
        </header>

        <section>
            <UForm
                v-if="selectedTab.slot === 'settings'"
                :schema="updateTwilioSettingSchema"
                :state="settingState"
                :disabled="isUpdatingSetting"
                class="space-y-5"
                @submit="updateSetting"
                @error="console.error"
            >
                <div class="grid grid-cols-2 gap-5">
                    <UFormGroup name="enabled">
                        <UCheckbox v-model="settingState.enabled" label="Enabled" :disabled="isUpdatingSetting" />
                    </UFormGroup>

                    <UFormGroup name="record_calls">
                        <UCheckbox v-model="settingState.record_calls" label="Record Calls" :disabled="isUpdatingSetting" />
                    </UFormGroup>
                </div>

                <UDivider />

                <div class="grid grid-cols-2 gap-5">
                    <UFormGroup name="account_sid" label="Account SID">
                        <UInput
                            v-model="settingState.account_sid"
                            placeholder="Enter Account SID"
                            :disabled="isUpdatingSetting"
                        />
                    </UFormGroup>
                    <UFormGroup name="auth_token" label="Auth Token">
                        <UInput v-model="settingState.auth_token" placeholder="Enter Auth Token" :disabled="isUpdatingSetting" />
                    </UFormGroup>
                </div>

                <UDivider />

                <div class="grid grid-cols-2 gap-5">
                    <UFormGroup name="api_key" label="API Key">
                        <UInput v-model="settingState.api_key" placeholder="Enter API Key" :disabled="isUpdatingSetting" />
                    </UFormGroup>
                    <UFormGroup name="twiml_sid" label="TwiML SID">
                        <UInput v-model="settingState.twiml_sid" placeholder="Enter TwiML SID" :disabled="isUpdatingSetting" />
                    </UFormGroup>
                    <UFormGroup name="api_secret" label="API Secret">
                        <UInput v-model="settingState.api_secret" placeholder="Enter API Secret" :disabled="isUpdatingSetting" />
                    </UFormGroup>
                </div>

                <div class="flex justify-end">
                    <UButton type="submit" :loading="isUpdatingSetting" :disabled="isUpdatingSetting">Update</UButton>
                </div>
            </UForm>

            <UForm
                v-if="selectedTab.slot === 'agent'"
                :schema="updateTwilioAgentSchema"
                :state="agentState"
                class="space-y-5"
                :disabled="isUpdatingAgent"
                @submit="updateAgent"
                @error="console.error"
            >
                <div class="grid grid-cols-2 gap-5">
                    <UFormGroup name="call_receiving_device" label="Device">
                        <USelect
                            v-model="agentState.call_receiving_device"
                            :options="[
                                { label: 'Computer', value: 'computer' },
                                { label: 'Phone', value: 'phone' },
                            ]"
                            :disabled="isUpdatingAgent"
                            placeholder="Select Device"
                        />
                    </UFormGroup>

                    <UFormGroup name="twilio_number" label="Twilio Number">
                        <UInput
                            v-model="agentState.twilio_number"
                            :disabled="isUpdatingAgent"
                            placeholder="Enter Twilio Number"
                        />
                    </UFormGroup>
                </div>
                <div class="flex justify-end">
                    <UButton type="submit" :loading="isUpdatingAgent" :disabled="isUpdatingAgent">Update</UButton>
                </div>
            </UForm>
        </section>
    </div>
</template>

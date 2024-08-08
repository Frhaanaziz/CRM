<script setup lang="ts">
import { Call, Device } from '@twilio/voice-sdk';
import { useDraggable, useWindowSize } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import type { Contact, Lead, Opportunity } from '~/types';

const { setMakeCall, setTwilioEnabled } = globalStore();
const { user } = storeToRefs(userSessionStore());

// pastikan data fetch ini tidak mengganggu performa aplikasi ketika dijalankan karena ada kemungkinan untuk terus menerus melakukan fetch
const { data: twilioSetting } = await useFetch(`/api/twilio-settings/${user.value?.user_metadata.twilio_setting_id}`, {
    key: 'twilio-setting',
    headers: useRequestHeaders(['cookie']),
    immediate: !!user.value?.user_metadata.twilio_setting_id,
});

let device: Device | undefined;
const log = ref('');
let _call: Call | null = null;
const contact = ref<Partial<Contact> | null>(null);

const showCallPopup = ref(false);
const showSmallCallWindow = ref(false);
const onCall = ref(false);
const calling = ref(false);
const muted = ref(false);
const callPopup = ref(null);
const counterUp = ref<{ stop: () => string; start: () => void; updatedTime: Ref<string> } | null>(null);
const callStatus = ref('');

const { width, height } = useWindowSize();
const { style } = useDraggable(callPopup, {
    initialValue: { x: width.value - 280, y: height.value - 300 },
    preventDefault: true,
});

async function startupClient() {
    log.value = 'Requesting Access Token...';

    try {
        const data = await $fetch('/api/integrations/twilio/generate-access-token', { method: 'POST' });

        log.value = 'Got a token.';
        intitializeDevice(data.token);
    } catch (err) {
        log.value = 'An error occurred. ' + getErrorMessage(err);
    }
}
function intitializeDevice(token: string) {
    device = new Device(token, {
        closeProtection: true,
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
    });

    addDeviceListeners();

    device.register();
}

function addDeviceListeners() {
    device?.on('registered', () => {
        log.value = 'Ready to make and receive calls!';
    });

    device?.on('unregistered', () => {
        log.value = 'Logged out';
    });

    device?.on('error', (error) => {
        log.value = 'Twilio.Device Error: ' + error.message;
    });

    device?.on('incoming', handleIncomingCall);

    device?.on('tokenWillExpire', async () => {
        const data = await $fetch('/api/integrations/twilio/generate-access-token', { method: 'POST' });
        device?.updateToken(data.token);
    });
}

function toggleMute() {
    if (!_call) return;

    if (_call.isMuted()) {
        _call.mute(false);
        muted.value = false;
    } else {
        _call.mute();
        muted.value = true;
    }
}

async function handleIncomingCall(call: Call) {
    log.value = `Incoming call from ${call.parameters.From}`;

    // get name of the caller from the phone number
    // contact.value = getContact(call.parameters.From);
    // if (!contact.value) {
    //     contact.value = getLeadContact(call.parameters.From);
    // }

    const contacts = await $fetch('/api/contacts/check', { query: { mobile_phone: call.parameters.From } });
    if (contacts.length > 0) {
        contact.value = contacts[0];
    }
    if (!contact.value) {
        contact.value = {
            first_name: 'Unknown',
            mobile_phone: call.parameters.From,
        };
    }

    showCallPopup.value = true;
    _call = call;

    _call.on('accept', (conn: any) => {
        console.info('conn', conn);
    });

    // add event listener to call object
    call.on('cancel', handleDisconnectedIncomingCall);
    call.on('disconnect', handleDisconnectedIncomingCall);
    call.on('reject', handleDisconnectedIncomingCall);
}

function acceptIncomingCall() {
    if (!_call) return;

    log.value = 'Accepted incoming call.';
    onCall.value = true;
    _call.accept();
    counterUp.value?.start();
}

function rejectIncomingCall() {
    if (!_call) return;

    _call.reject();
    log.value = 'Rejected incoming call';
    showCallPopup.value = false;
    if (showSmallCallWindow.value == undefined) {
        showSmallCallWindow.value = false;
    } else {
        showSmallCallWindow.value = false;
    }
    callStatus.value = '';
    muted.value = false;
}

function hangUpCall() {
    if (!_call) return;

    _call.disconnect();
    log.value = 'Hanging up incoming call';
    onCall.value = false;
    callStatus.value = '';
    muted.value = false;
    // note.value = {
    //     title: '',
    //     content: '',
    // };
    counterUp.value?.stop();
}

function handleDisconnectedIncomingCall() {
    log.value = `Call ended from handle disconnected Incoming call.`;
    showCallPopup.value = false;
    if (showSmallCallWindow.value == undefined) {
        showSmallCallWindow.value = false;
    } else {
        showSmallCallWindow.value = false;
    }
    _call = null;
    muted.value = false;
    onCall.value = false;
    counterUp.value?.stop();
}

async function makeOutgoingCall({
    contact: caller,
    lead_id,
    opportunity_id,
}: {
    contact: Contact;
    lead_id?: Lead['id'];
    opportunity_id?: Opportunity['id'];
}) {
    if (!Device.isSupported) {
        toast.error('Sorry, your browser does not support the required features. Please use a different browser.');
        return;
    }

    if (!caller.mobile_phone) {
        toast.error('Mobile phone number is required to make a call.');
        return;
    }

    // check if number has a country code
    // if (number?.replace(/[^0-9+]/g, '').length == 10) {
    //   $dialog({
    //     title: 'Invalid Mobile Number',
    //     message: `${number} is not a valid mobile number. Either add a country code or check the number again.`,
    //   })
    //   return
    // }

    contact.value = caller;

    if (device) {
        log.value = `Attempting to call ${caller.mobile_phone} ...`;

        try {
            _call = await device.connect({
                params: {
                    To: caller.mobile_phone,
                    contact_id: caller.id.toString(),
                    user_id: user.value!.id,
                    organization_id: user.value!.user_metadata.organization_id,
                    ...(lead_id && { lead_id: lead_id.toString() }),
                    ...(opportunity_id && { opportunity_id: opportunity_id.toString() }),
                },
            });

            showCallPopup.value = true;
            callStatus.value = 'initiating';

            _call.on('messageReceived', (message: any) => {
                const info = message.content;
                callStatus.value = info.CallStatus;

                log.value = `Call status: ${info.CallStatus}`;

                if (info.CallStatus == 'in-progress') {
                    log.value = `Call in progress.`;
                    calling.value = false;
                    onCall.value = true;
                    counterUp.value?.start();
                }
            });

            _call.on('accept', () => {
                log.value = `Initiated call!`;
                showCallPopup.value = true;
                calling.value = true;
                onCall.value = false;
            });
            _call.on('disconnect', () => {
                log.value = `Call ended from makeOutgoing call disconnect.`;
                calling.value = false;
                onCall.value = false;
                showCallPopup.value = false;
                showSmallCallWindow.value = false;
                _call = null;
                callStatus.value = '';
                muted.value = false;
                counterUp.value?.stop();
                // note.value = {
                //     title: '',
                //     content: '',
                // };
            });
            _call.on('cancel', () => {
                log.value = `Call ended from makeOutgoing call cancel.`;
                calling.value = false;
                onCall.value = false;
                showCallPopup.value = false;
                showSmallCallWindow.value = false;
                _call = null;
                callStatus.value = '';
                muted.value = false;
                // note.value = {
                //     title: '',
                //     content: '',
                // };
                counterUp.value?.stop();
            });
        } catch (error) {
            log.value = `Could not connect call: ${getErrorMessage(error)}`;
        }
    } else {
        log.value = 'Unable to make call.';
    }
}

function cancelCall() {
    if (!_call) return;

    _call.disconnect();
    showCallPopup.value = false;
    if (showSmallCallWindow.value == undefined) {
        showSmallCallWindow.value = false;
    } else {
        showSmallCallWindow.value = false;
    }
    calling.value = false;
    onCall.value = false;
    callStatus.value = '';
    muted.value = false;
    // note.value = {
    //     title: '',
    //     content: '',
    // };
}

function toggleCallWindow() {
    showCallPopup.value = !showCallPopup.value;
    if (showSmallCallWindow.value == undefined) {
        showSmallCallWindow.value = !showSmallCallWindow.value;
    } else {
        showSmallCallWindow.value = !showSmallCallWindow.value;
    }
}

onMounted(async () => {
    if (!twilioSetting.value || !user.value) return;

    const enabled = twilioSetting.value.enabled;
    if (enabled === undefined) {
        toast.error('Please contact administrator to enable Twilio integration.');
        return;
    }

    setTwilioEnabled(enabled);
    // enabled && startupClient();
    enabled && (await startupClient());

    setMakeCall(makeOutgoingCall);
});

watch(log, (v) => console.log(v));
</script>

<template>
    <ClientOnly>
        <div v-show="showCallPopup" v-bind="$attrs">
            <div
                ref="callPopup"
                class="fixed z-20 flex w-60 cursor-move select-none flex-col rounded-lg bg-gray-900 p-4 text-gray-300 shadow-2xl"
                :style="style"
            >
                <div class="flex flex-row-reverse items-center gap-1">
                    <UIcon name="i-heroicons-arrows-pointing-in" class="h-5 w-5 cursor-pointer" @click="toggleCallWindow" />
                </div>
                <div class="flex flex-col items-center justify-center gap-3">
                    <UAvatar
                        :src="getFallbackAvatarUrl('FA')"
                        size="3xl"
                        :ui="{ size: { ['3xl']: 'h-24 w-24 text-3xl' } }"
                        :class="onCall || calling ? '' : 'pulse'"
                    />
                    <div class="flex flex-col items-center justify-center gap-1">
                        <div class="text-xl font-medium">
                            {{ getUserFullName(contact) }}
                        </div>
                        <div class="text-sm text-gray-600">
                            {{ contact?.mobile_phone }}
                        </div>
                    </div>
                    <CountUpTimer ref="counterUp">
                        <div v-if="onCall" class="my-1 text-base">
                            {{ counterUp?.updatedTime }}
                        </div>
                    </CountUpTimer>
                    <div v-if="!onCall" class="my-1 text-base">
                        {{
                            callStatus == 'initiating'
                                ? 'Initiating call...'
                                : callStatus == 'ringing'
                                  ? 'Ringing...'
                                  : calling
                                    ? 'Calling...'
                                    : 'Incoming call...'
                        }}
                    </div>
                    <div v-if="onCall" class="flex gap-2">
                        <UButton color="white" square :ui="{ rounded: 'rounded-full' }" @click="toggleMute">
                            <img v-if="muted" src="/icons/microphone-slash-solid.svg" width="16" heigt="16" />
                            <UIcon v-else name="i-heroicons-microphone-solid" class="h-4 w-4" />
                        </UButton>
                        <UButton color="red" square :ui="{ rounded: 'rounded-full' }" @click="hangUpCall">
                            <UIcon name="i-heroicons-phone-solid" class="h-4 w-4 rotate-[135deg]" />
                        </UButton>
                    </div>
                    <div v-else-if="calling || callStatus == 'initiating'">
                        <UButton color="red" :disabled="callStatus == 'initiating'" @click="cancelCall">
                            <UIcon name="i-heroicons-phone-solid" class="mt-1 h-4 w-4 rotate-[135deg]" />
                            Cancel
                        </UButton>
                    </div>
                    <div v-else class="flex gap-2">
                        <UButton color="green" :ui="{ rounded: 'rounded-lg' }" @click="acceptIncomingCall">
                            <UIcon name="i-heroicons-phone-solid" class="h-4 w-4" />
                            Accept
                        </UButton>
                        <UButton color="red" :ui="{ rounded: 'rounded-lg' }" @click="rejectIncomingCall">
                            <UIcon name="i-heroicons-phone-solid" class="mt-1 h-4 w-4 rotate-[135deg]" />
                            Reject
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
        <!-- class=" ml-2 flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg bg-gray-900 px-2 py-[7px] text-base text-gray-300" -->
        <div
            v-show="showSmallCallWindow"
            class="absolute right-4 top-4 z-[99999] ml-2 flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg bg-gray-900 px-2 py-[7px] text-base text-gray-300"
            v-bind="$attrs"
            @click="toggleCallWindow"
        >
            <div class="flex items-center gap-2">
                <UAvatar :src="getFallbackAvatarUrl('FA')" size="xs" />
                <div class="max-w-[120px] truncate">
                    {{ getUserFullName(contact) }}
                </div>
            </div>
            <div v-if="onCall" class="flex items-center gap-2">
                <div class="my-1 min-w-[40px] text-center">
                    {{ counterUp?.updatedTime }}
                </div>
                <UButton color="red" square :ui="{ rounded: 'rounded-full' }" @click.stop="hangUpCall">
                    <UIcon name="i-heroicons-phone-solid" class="mt-1 h-4 w-4 rotate-[135deg]" />
                </UButton>
            </div>
            <div v-else-if="calling" class="flex items-center gap-3">
                <div class="my-1">
                    {{ callStatus == 'ringing' ? 'Ringing...' : 'Calling...' }}
                </div>
                <UButton color="red" :ui="{ rounded: 'rounded-full' }" square size="sm" @click.stop="cancelCall">
                    <UIcon name="i-heroicons-phone-solid" class="mt-1 h-4 w-4 rotate-[135deg]" />
                </UButton>
            </div>
            <div v-else class="flex items-center gap-2">
                <UButton color="green" :ui="{ rounded: 'rounded-full' }" square size="2xs" @click.stop="acceptIncomingCall">
                    <UIcon name="i-heroicons-phone-solid" class="h-4 w-4 animate-pulse" />
                </UButton>
                <UButton color="red" :ui="{ rounded: 'rounded-full' }" square size="2xs" @click.stop="rejectIncomingCall">
                    <UIcon name="i-heroicons-phone-solid" class="h-4 w-4 rotate-[135deg]" />
                </UButton>
            </div>
        </div>
    </ClientOnly>
</template>

<style scoped>
.pulse::before {
    content: '';
    position: absolute;
    border: 1px solid green;
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    border-radius: 50%;
    animation: pulse 1s linear infinite;
}

.pulse::after {
    content: '';
    position: absolute;
    border: 1px solid green;
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    border-radius: 50%;
    animation: pulse 1s linear infinite;
    animation-delay: 0.3s;
}

@keyframes pulse {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    50% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(1.3);
        opacity: 0;
    }
}
</style>

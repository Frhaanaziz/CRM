<script setup lang="ts">
import { useStepper } from '@vueuse/core';

const supabase = useSupabaseClient();
const sessionStore = userSessionStore();
const { user } = storeToRefs(sessionStore);

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

const salesSizesOption = ['Just me', '2-10', '11-25', '26-50', '51-200', '201+'];
const leadSourcesOption = [
    "i don't have any leads yet",
    'My email inbox',
    'CSV/Spreadsheet',
    'Act!',
    'ActiveCampaign',
    'Agile CRM',
    'Attio',
    'Capsule CRN',
    'Copper',
    'Firmao',
    'FowCRM',
    'GoHighLevel',
    'Google Sheets',
    'Highrise',
    'HubSpot',
    'Insightly',
    'Keap',
    'Less Annoying CRM',
    'MS Dynamics',
    'Nimble',
    'Nutshell',
    'OnePage CRM',
    'Pipedrive',
    'PipelineDeals',
    'Redtail CRM',
    'Salesforce',
    'Streak',
    'SugarCRM',
    'SuiteCRM',
    'Wealthbox',
    'Zoho CRM',
    'Other',
];

const stepper = useStepper(['profile-setup', 'create-organization', 'join-organization']);

const isSubmitting = ref(false);

const { profileForm, profileState, submitProfile } = useProfileSetup();
const { createOrganizationForm, organizationState, submitOrganization } = useCreateOrganization();
const { joinOrganizationForm, joinOrganizationState, submitJoinOrganization } = useJoinOrganization();

const nextStep = () => profileForm.value?.validate(['phone', 'expectation']).then(stepper.goToNext);
async function submitForm() {
    try {
        if (joinOrganizationState.value.code) {
            await profileForm.value?.validate();
            await submitProfile();

            await joinOrganizationForm.value?.validate();
            await submitJoinOrganization();

            const { data: auth } = await supabase.auth.refreshSession();
            sessionStore.session = auth.session;
            sessionStore.user = auth.user;

            toast.success('You have successfully joined the organization.');
            await navigateTo('/dashboard');
        } else {
            await profileForm.value?.validate();
            await submitProfile();

            await createOrganizationForm.value?.validate();
            await submitOrganization();

            const { data: auth } = await supabase.auth.refreshSession();
            sessionStore.session = auth.session;
            sessionStore.user = auth.user;

            toast.success('You have successfully created an organization.');
            await navigateTo('/dashboard');
        }
    } catch (error) {
        // console.error('error', error);
    }
}
function useProfileSetup() {
    const profileForm = ref();
    const state = ref({
        phone: user.value?.user_metadata?.phone ?? '',
        expectation: [],
    });

    async function onSubmit() {
        try {
            isSubmitting.value = true;

            await $fetch(`/api/users/${user.value?.id}/setup`, {
                method: 'POST',
                body: JSON.stringify(state.value),
            });
        } catch (e) {
            console.error('Error setup profile:', e);
            toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        profileForm,
        profileState: state,
        submitProfile: onSubmit,
    };
}
function useCreateOrganization() {
    const createOrganizationForm = ref();
    const state = ref({
        user_id: user.value?.id,
        name: '',
        website: '',
        industry_id: undefined,
        size_id: undefined,
        sales_size: '',
        lead_source: '',
    });

    async function onSubmit() {
        try {
            isSubmitting.value = true;

            await $fetch('/api/organizations', {
                method: 'POST',
                body: JSON.stringify(state.value),
            });
        } catch (e) {
            console.error('Error setup organization:', e);
            toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        createOrganizationForm,
        organizationState: state,
        submitOrganization: onSubmit,
    };
}
function useJoinOrganization() {
    const joinOrganizationForm = ref();
    const state = ref({
        code: '',
    });

    async function onSubmit() {
        try {
            isSubmitting.value = true;

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
            console.error('Error join organization:', e);
            toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        joinOrganizationForm,
        joinOrganizationState: state,
        submitJoinOrganization: onSubmit,
    };
}
async function handleSignout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out, please try again.');
    }

    sessionStore.session = null;
    sessionStore.user = null;

    await navigateTo('/auth/signin');
}
</script>

<template>
    <div>
        <NuxtImg src="/images/pipeline-logo.png" alt="pipeline" height="32" class="absolute left-0 top-0 p-10" />

        <main class="relative mx-auto min-h-screen w-[800px]">
            <section class="py-20">
                <div class="space-y-10">
                    <UProgress :value="stepper.isCurrent('profile-setup') ? 66 : 99" class="pt-10" color="green" />

                    <div v-if="stepper.isCurrent('profile-setup')" class="not-sr-only h-8" />
                    <UButton
                        v-else
                        icon="i-heroicons-chevron-left"
                        size="sm"
                        variant="ghost"
                        color="black"
                        @click="stepper.goToPrevious"
                    >
                        Back
                    </UButton>

                    <div class="space-y-5 text-slate-700">
                        <h1 v-if="stepper.isCurrent('profile-setup')" class="text-4xl font-semibold">
                            Tell us about yourself, {{ user?.user_metadata?.first_name }}.
                        </h1>
                        <h1 v-else-if="stepper.isCurrent('create-organization')" class="text-4xl font-semibold">
                            Tell us about your company
                        </h1>
                        <h1 v-else-if="stepper.isCurrent('join-organization')" class="text-4xl font-semibold">
                            Enter Invite Code
                        </h1>

                        <p v-if="stepper.isCurrent('profile-setup')">Let's set up your profile</p>
                        <p v-else-if="stepper.isCurrent('create-organization')">Help us personalize your experience</p>
                        <p v-else-if="stepper.isCurrent('join-organization')">Get the invite code from organization owner.</p>
                    </div>
                </div>

                <div class="mt-20">
                    <UForm
                        v-if="stepper.isCurrent('profile-setup')"
                        ref="profileForm"
                        :schema="setupUserSchema"
                        :state="profileState"
                        class="space-y-10"
                        @submit="submitProfile"
                    >
                        <UFormGroup label="Phone Number" name="phone" required>
                            <UInput v-model="profileState.phone" class="max-w-[392px]" placeholder="e.g. +62 812 5555 8888" />
                        </UFormGroup>

                        <UFormGroup label="What do you hope todo with this CRM?" name="expectation">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex items-center gap-4 rounded-lg border p-4">
                                    <UCheckbox
                                        id="Improve my sales inbound process"
                                        v-model="profileState.expectation"
                                        label="Improve my sales inbound process"
                                        value="Improve my sales inbound process"
                                    />
                                </div>
                                <div class="flex items-center gap-4 rounded-lg border p-4">
                                    <UCheckbox
                                        id="Keep track of Leads and contacts"
                                        v-model="profileState.expectation"
                                        label="Keep track of Leads and contacts"
                                        value="Keep track of Leads and contacts"
                                    />
                                </div>
                                <div class="flex items-center gap-4 rounded-lg border p-4">
                                    <UCheckbox
                                        id="Get clear reporting of sales performance"
                                        v-model="profileState.expectation"
                                        label="Get clear reporting of sales performance"
                                        value="Get clear reporting of sales performance"
                                    />
                                </div>
                                <div class="flex items-center gap-4 rounded-lg border p-4">
                                    <UCheckbox
                                        id="Increase outbound call and email volume"
                                        v-model="profileState.expectation"
                                        label="Increase outbound call and email volume"
                                        value="Increase outbound call and email volume"
                                    />
                                </div>
                                <div class="flex items-center gap-4 rounded-lg border p-4">
                                    <UCheckbox id="Other" v-model="profileState.expectation" label="Other" value="Other" />
                                </div>
                            </div>
                        </UFormGroup>
                    </UForm>

                    <template v-if="stepper.isCurrent('create-organization')">
                        <LazyUForm
                            ref="createOrganizationForm"
                            :schema="createOrganizationSchema"
                            :state="organizationState"
                            class="grid grid-cols-2 gap-4"
                            @submit="submitOrganization"
                        >
                            <UFormGroup label="Company Name" name="name" required>
                                <UInput
                                    v-model="organizationState.name"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                    placeholder="Enter your company name"
                                />
                            </UFormGroup>

                            <UFormGroup label="Website" name="website" required>
                                <UInput
                                    v-model="organizationState.website"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                    placeholder="Enter your company website"
                                />
                            </UFormGroup>

                            <UFormGroup label="How big is your company?" name="size_id">
                                <USelectMenu
                                    v-model="organizationState.size_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="sizesOption ?? []"
                                    placeholder="Select your company size"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>

                            <UFormGroup label="How big is your sales team?" name="sales_size">
                                <USelectMenu
                                    v-model="organizationState.sales_size"
                                    :options="salesSizesOption"
                                    placeholder="Select your team size"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>

                            <UFormGroup label="Industry" name="industry_id">
                                <USelectMenu
                                    v-model="organizationState.industry_id"
                                    value-attribute="value"
                                    option-attribute="label"
                                    :options="industriesOption ?? []"
                                    searchable
                                    searchable-placeholder="Search a industries..."
                                    placeholder="Select your industry"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>

                            <UFormGroup label="Where are your Leads today?" name="lead_source">
                                <USelectMenu
                                    v-model="organizationState.lead_source"
                                    :options="leadSourcesOption"
                                    placeholder="Select a Lead Source"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>
                        </LazyUForm>

                        <button class="mt-20 text-sm text-brand" @click="stepper.goToNext">Or Join an Organization</button>
                    </template>

                    <LazyUForm
                        v-if="stepper.isCurrent('join-organization')"
                        ref="joinOrganizationForm"
                        :schema="joinOrganizationSchema"
                        :state="joinOrganizationState"
                        @submit="submitJoinOrganization"
                    >
                        <UFormGroup label="Invite Code" name="code" required>
                            <UInput
                                v-model="joinOrganizationState.code"
                                :loading="isSubmitting"
                                :disabled="isSubmitting"
                                placeholder="Enter invite code"
                                class="max-w-[392px]"
                            />
                        </UFormGroup>
                    </LazyUForm>
                </div>
            </section>

            <section class="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t pb-[60px] pt-10">
                <div class="flex items-center gap-5">
                    <UButton color="gray" size="2xs" class="px-8" @click="handleSignout">Log Out</UButton>
                    <NuxtLink :href="`mailto:${supportEmail}`" external class="text-sm text-slate-700">
                        Need help or have a question?
                    </NuxtLink>
                </div>

                <UButton v-if="stepper.isCurrent('profile-setup')" size="2xs" class="px-8" @click="nextStep">Next</UButton>
                <UButton v-else size="2xs" class="px-8" :loading="isSubmitting" :disabled="isSubmitting" @click="submitForm"
                    >Confirm</UButton
                >
            </section>
        </main>
    </div>
</template>

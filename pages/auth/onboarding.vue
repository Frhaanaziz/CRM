<script setup lang="ts">
import { useStepper } from '@vueuse/core';

const google_refresh_token = useRoute().query.refresh_token;
const { user } = storeToRefs(userSessionStore());

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

const firstStep = 'profile-setup';
const stepper = useStepper(['profile-setup', 'create-organization', 'join-organization'], firstStep);

const isSubmitting = ref(false);

const { profileForm, profileState, submitProfile } = useProfileSetup();
const { createOrganizationForm, organizationState, createOrganization } = useCreateOrganization();
const { joinOrganizationForm, joinOrganizationState, joinOrganization } = useJoinOrganization();

const nextStep = () => {
    if (stepper.isCurrent('profile-setup')) {
        profileForm.value?.validate(['phone', 'expectation']).then(stepper.goToNext);
    } else {
        stepper.goToNext();
    }
};

async function submitJoinOrganization() {
    try {
        await joinOrganizationForm.value?.validate();

        await submitProfile();
        await joinOrganization();

        await useRefreshAuthSession();

        toast.success('You have successfully joined the organization.');
        await navigateTo('/dashboard');
    } catch (error) {
        console.error('onboarding submitJoinOrganization: ', error);
    }
}
async function submitCreateOrganization() {
    try {
        await createOrganizationForm.value?.validate();

        await submitProfile();
        await createOrganization();

        await useRefreshAuthSession();

        toast.success('You have successfully created an organization.');
        await navigateTo('/dashboard');
    } catch (error) {
        console.error('onboarding submitCreateOrganization: ', error);
    }
}

function useProfileSetup() {
    const profileForm = ref();
    const state = ref({
        phone: user.value?.user_metadata?.phone ?? '',
        expectation: [],
        google_refresh_token,
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
        name: '',
        website: '',
        industry_id: undefined,
        size_id: undefined,
        sales_size: '',
        lead_source: '',
    });

    async function createOrganization() {
        try {
            isSubmitting.value = true;

            await $fetch('/api/organizations', {
                method: 'POST',
                body: JSON.stringify(state.value),
            });
        } catch (e) {
            console.error('Error setup organization:', e);
            // toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        createOrganizationForm,
        organizationState: state,
        createOrganization,
    };
}
function useJoinOrganization() {
    const joinOrganizationForm = ref();
    const state = ref({
        code: '',
        email: user.value?.email,
    });

    async function joinOrganization() {
        try {
            isSubmitting.value = true;

            await $fetch('/api/organizations/join', {
                method: 'POST',
                body: JSON.stringify(state.value),
            });
        } catch (e) {
            console.error('Error join organization:', e);
            // toast.error(getErrorMessage(e));
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        joinOrganizationForm,
        joinOrganizationState: state,
        joinOrganization,
    };
}
</script>

<template>
    <div>
        <NuxtLink href="/dashboard">
            <NuxtImg src="/images/pipeline-logo.png" alt="pipeline" height="32" class="absolute left-0 top-0 p-10" />
        </NuxtLink>

        <main class="mx-auto flex min-h-screen w-[800px] flex-col">
            <section class="my-10 pt-20">
                <div class="space-y-10">
                    <UProgress v-if="stepper.isCurrent('profile-setup')" :value="66" class="pt-10" color="green" />
                    <UProgress v-else :value="99" class="pt-10" color="green" />

                    <UButton
                        v-if="!stepper.isCurrent(firstStep)"
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

                            <UFormGroup label="How big is your company?" name="size_id" required>
                                <USelectMenu
                                    v-model="organizationState.size_id"
                                    value-attribute="value"
                                    :options="sizesOption ?? []"
                                    placeholder="Select your company size"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>

                            <UFormGroup label="How big is your sales team?" name="sales_size" required>
                                <USelectMenu
                                    v-model="organizationState.sales_size"
                                    :options="salesSizesOption"
                                    placeholder="Select your team size"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>

                            <UFormGroup label="Industry" name="industry_id" required>
                                <USelectMenu
                                    v-model="organizationState.industry_id"
                                    value-attribute="value"
                                    :options="industriesOption ?? []"
                                    searchable
                                    searchable-placeholder="Search a industries..."
                                    placeholder="Select your industry"
                                    :loading="isSubmitting"
                                    :disabled="isSubmitting"
                                />
                            </UFormGroup>

                            <UFormGroup label="Where are your Leads today?" name="lead_source" required>
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

            <section class="mt-auto flex items-center justify-between border-t pb-[60px] pt-10">
                <div class="flex items-center gap-5">
                    <UButton color="gray" size="2xs" class="px-8" @click="signOutUser">Log Out</UButton>
                    <NuxtLink :href="`mailto:${supportEmail}`" external class="text-sm text-slate-700">
                        Need help or have a question?
                    </NuxtLink>
                </div>

                <UButton v-if="stepper.isCurrent(firstStep)" size="2xs" class="px-8" @click="nextStep"> Next </UButton>
                <UButton
                    v-else
                    size="2xs"
                    class="px-8"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                    @click="
                        () => {
                            if (stepper.isCurrent('create-organization')) submitCreateOrganization();
                            else if (stepper.isCurrent('join-organization')) submitJoinOrganization();
                            else toast.error('Failed to submit form, please try again later.');
                        }
                    "
                >
                    Confirm
                </UButton>
            </section>
        </main>
    </div>
</template>

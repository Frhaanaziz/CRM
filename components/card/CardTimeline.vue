<script setup lang="ts">
import { useDateFormat } from '@vueuse/core';
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Activity, ActivityParticipant, ActivityParticipantRoles, User } from '~/types';

const props = defineProps<{
    company_id?: number;
    contact_id?: number;
    lead_id?: number;
    opportunity_id?: number;
}>();
const createMode = ref<'call' | 'note' | 'email' | undefined>();
const { user } = storeToRefs(userSessionStore());

interface IActivity extends Activity {
    participants: (ActivityParticipant & { user: User | null })[];
}
const { data: activities } = await useFetch('/api/activities', {
    query: props,
    // sort activity by created_at in descending order
    transform: (activities) =>
        activities.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }),
    headers: useRequestHeaders(['cookie']),
});

const { noteState, createNote, isCreatingNote } = useCreateNote();

function getParticipantByRole(activity: IActivity, roleName: ActivityParticipantRoles) {
    return activity.participants.find((participant) => participant.role === roleName);
}
function useCreateNote() {
    type CreateNoteType = z.infer<typeof createActivitySchema>;
    const initialState = {
        ...props,
        subject: '',
        description: '',
        type: 'note',
    };
    const noteState = ref({ ...initialState });
    const isCreating = ref(false);

    async function createNote(event: FormSubmitEvent<CreateNoteType>) {
        try {
            isCreating.value = true;

            await $fetch('/api/activities', {
                method: 'POST',
                body: JSON.stringify(event.data),
            });

            toast.success('Note created successfully');
            createMode.value = undefined;
            noteState.value = { ...initialState };
            await refreshNuxtData();
        } catch (error) {
            console.error('Error creating note', error);
            toast.error('Failed to create note, please try again later.');
        } finally {
            isCreating.value = false;
        }
    }

    return { noteState, createNote, isCreatingNote: isCreating };
}
</script>

<template>
    <UCard
        :ui="{
            divide: 'divide-y-0',
        }"
    >
        <template #header>
            <h2 class="text-xl font-semibold">TIMELINE</h2>
        </template>

        <UInput icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search timeline" />

        <div class="my-4 flex items-center gap-1">
            <p class="font-semibold">Create new:</p>
            <UButton
                variant="outline"
                color="black"
                icon="i-heroicons-clipboard"
                class="font-semibold ring-gray-400"
                size="xs"
                :ui="{ rounded: 'rounded-xl' }"
                @click="createMode = 'note'"
            >
                Note
            </UButton>
            <UButton
                variant="outline"
                color="black"
                icon="i-heroicons-envelope"
                class="font-semibold ring-gray-400"
                size="xs"
                :ui="{ rounded: 'rounded-xl' }"
                disabled
                @click="createMode = 'email'"
            >
                Email
            </UButton>
            <UButton
                variant="outline"
                color="black"
                icon="i-heroicons-phone"
                class="font-semibold ring-gray-400"
                size="xs"
                :ui="{ rounded: 'rounded-xl' }"
                @click="createMode = 'call'"
            >
                Call
            </UButton>
        </div>

        <div class="space-y-4">
            <!-- Note Create Mode -->
            <div v-if="createMode === 'note'" class="flex items-start gap-2">
                <UAvatar :src="getUserFallbackAvatarUrl()" size="md" />

                <UForm
                    class="w-full divide-y rounded border"
                    :schema="createActivitySchema"
                    :state="noteState"
                    @submit="createNote"
                    @error="console.error"
                >
                    <p class="m-2 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-clipboard" class="h-5 w-5 text-black" />
                        <span>New Note</span>
                    </p>
                    <UFormGroup name="subject">
                        <UInput v-model="noteState.subject" variant="none" placeholder="Subject" :disabled="isCreatingNote" />
                    </UFormGroup>
                    <UFormGroup name="description">
                        <UTextarea
                            v-model="noteState.description"
                            variant="none"
                            placeholder="Description"
                            autoresize
                            :maxrows="10"
                            :disabled="isCreatingNote"
                        />
                    </UFormGroup>

                    <div class="flex items-center gap-4 p-2">
                        <UButton
                            type="submit"
                            icon="i-heroicons-clipboard"
                            trailing
                            class="font-semibold"
                            :disabled="isCreatingNote"
                            :ui="{
                                icon: {
                                    size: {
                                        sm: 'h-4 w-4',
                                    },
                                },
                            }"
                        >
                            Save
                        </UButton>
                        <UButton
                            type="button"
                            variant="ghost"
                            color="black"
                            :disabled="isCreatingNote"
                            @click="createMode = undefined"
                        >
                            Cancel
                        </UButton>
                    </div>
                </UForm>
            </div>

            <!-- Call Create Mode -->
            <div v-if="createMode === 'call'" class="flex items-start gap-2">
                <UAvatar :src="getUserFallbackAvatarUrl()" size="md" />
                <div class="w-full divide-y rounded border">
                    <p class="m-2 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-phone" class="h-5 w-5 text-black" />
                        <span>New Call</span>
                    </p>
                    <p class="flex items-center gap-2 bg-base-300 p-2">
                        <span class="font-semibold">From</span>
                        <span>{{ getUserFullName(user?.user_metadata) }}</span>
                        <span>{{ user?.user_metadata?.phone ?? '---' }}</span>
                    </p>
                    <div class="flex items-center justify-between divide-x">
                        <p class="flex-1 p-2">To <span class="font-semibold text-brand">Lilly Pyles</span></p>
                        <p class="w-[240px] p-2">786-555-0186</p>
                    </div>
                    <UInput variant="none" placeholder="Subject" />
                    <UTextarea variant="none" placeholder="Description" autoresize :maxrows="10" />
                    <div class="flex items-center gap-4 p-2">
                        <UButton
                            icon="i-heroicons-phone"
                            trailing
                            class="font-semibold"
                            disabled
                            :ui="{
                                icon: {
                                    size: {
                                        sm: 'h-4 w-4',
                                    },
                                },
                            }"
                        >
                            Call
                        </UButton>
                        <UButton variant="ghost" color="black" @click="createMode = undefined">Cancel</UButton>
                    </div>
                </div>
            </div>

            <template v-for="activity in activities">
                <!-- Closed As Won -->
                <div v-if="activity.type === 'closed as won'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-black" />
                            <span>Closed as Won by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                        <!-- <p class="text-weak mt-2">Rp225.000.000 - One-time</p> -->
                    </div>
                </div>

                <!-- Closed As Lost // -->
                <div v-if="activity.type === 'closed as lost'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-x-circle" class="h-5 w-5 text-black" />
                            <span>Closed as Lost by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                        <p class="text-weak mt-2">Reason: Pricing</p>
                    </div>
                </div>

                <!-- Reopened // -->
                <div v-if="activity.type === 'reopened'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5 -scale-x-[1] text-black" />
                            <span>Reopened by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Qualified // -->
                <div v-if="activity.type === 'qualified'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-check" class="h-5 w-5 text-black" />
                            <span>Qualified by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Disqualified -->
                <div v-if="activity.type === 'disqualified'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-x-mark" class="h-5 w-5 text-black" />
                            <span>Disqualified by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Note Activity // -->
                <div v-if="activity.type === 'note'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-clipboard" class="h-5 w-5 text-black" />
                            <span>Note: {{ activity.subject }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                        <p v-if="activity.description" class="text-weak mt-2">{{ activity.description }}</p>
                    </div>
                </div>

                <!-- Call Activity -->
                <div v-if="activity.type === 'calling'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl()" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-phone" class="h-5 w-5 text-black" />
                            <span>Subject: {{ activity.subject }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                        <p class="text-weak mt-2">Discuss our services</p>
                    </div>
                </div>

                <!-- Mail Activity -->
                <div v-if="activity.type === 'email'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl()" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-envelope" class="h-5 w-5 text-black" />
                            <span>Subject: {{ activity.subject }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                        <p class="text-weak mt-2">Dear Lilly Pyles,</p>
                        <p class="text-weak">
                            Thank you for visiting our Web site. We have forwarded your request for additional information to...
                        </p>
                    </div>
                </div>

                <!-- Assigned Activity // -->
                <div v-if="activity.type === 'assigned'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="getUserFallbackAvatarUrl()" size="md" />
                    <div class="w-full rounded border p-2">
                        <p class="mb-1 flex items-center gap-2 font-semibold">
                            <UIcon name="i-heroicons-user" class="h-5 w-5 text-black" />
                            <span>{{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span>
                            Assigned this lead to
                            <span>{{ getUserFullName(getParticipantByRole(activity, 'assignee')?.user) }}</span>
                        </p>
                        <div class="text-weak flex items-center gap-1 text-xs">
                            <p>{{ getUserFullName(activity.user) }}</p>
                            &middot;
                            <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Lead Source -->
                <!-- <div  v-if="activity.type === 'closed as won'" :key="activity.id" class="flex items-start gap-2">
                    <UAvatar :src="'/icons/pipeline-rounded-blue-logo.svg'" size="md" :ui="{ rounded: 'rounded-none' }" />
                    <div class="">
                        <div class="text-weak flex w-full items-center gap-1 rounded border p-2">
                            <p class="text-sm">Lead Source - <span class="font-semibold">Manual Input</span></p>
                            &middot;
                            <p class="text-xs">2/12/2024 3:33 AM</p>
                        </div>
                    </div>
                </div> -->
            </template>
        </div>
    </UCard>
</template>

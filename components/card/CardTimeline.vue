<script setup lang="ts">
import { useDateFormat } from '@vueuse/core';
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Activity, ActivityParticipant, ActivityParticipantRoles, User } from '~/types';

const props = defineProps<{
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
            // divide: 'divide-y-0',
            body: {
                padding: 'px-0 py-0 sm:px-0 sm:py-0 ',
            },
            header: {
                padding: 'py-4 px-4 sm:px-4 ',
            },
        }"
    >
        <template #header>
            <h2 class="font-semibold text-slate-700">Timeline</h2>

            <div class="my-1 flex items-center gap-2.5">
                <UButton
                    label="Note"
                    color="white"
                    class="ring-gray-400"
                    :ui="{ rounded: 'rounded-full' }"
                    @click="createMode === 'note' ? (createMode = undefined) : (createMode = 'note')"
                >
                    <template #trailing>
                        <UIcon name="i-heroicons-document-minus-solid" class="h-4 w-4" />
                    </template>
                </UButton>
                <UButton
                    label="Email"
                    color="white"
                    class="ring-gray-400"
                    :ui="{ rounded: 'rounded-full' }"
                    disabled
                    @click="createMode = 'email'"
                >
                    <template #trailing>
                        <UIcon name="i-heroicons-envelope-solid" class="h-4 w-4" />
                    </template>
                </UButton>
                <UButton
                    label="Call"
                    color="white"
                    class="ring-gray-400"
                    :ui="{ rounded: 'rounded-full' }"
                    @click="createMode = 'call'"
                >
                    <template #trailing>
                        <UIcon name="i-heroicons-phone-solid" class="h-4 w-4" />
                    </template>
                </UButton>
            </div>
        </template>

        <div class="space-y-4">
            <!-- Note Create Mode -->
            <UForm
                v-if="createMode === 'note'"
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

            <!-- Call Create Mode -->
            <div v-if="createMode === 'call'" class="w-full divide-y rounded border">
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

            <ul>
                <template v-for="activity in activities">
                    <!-- Closed As Won -->
                    <li v-if="activity.type === 'closed as won'" :key="activity.id" class="flex items-start gap-2 p-4">
                        <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                        <div class="w-full rounded border p-2">
                            <p class="mb-1 flex items-center gap-2 font-semibold">
                                <UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-black" />
                                <span
                                    >Closed as Won by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span
                                >
                            </p>
                            <div class="text-weak flex items-center gap-1 text-xs">
                                <p>{{ getUserFullName(activity.user) }}</p>
                                &middot;
                                <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                            </div>
                            <!-- <p class="text-weak mt-2">Rp225.000.000 - One-time</p> -->
                        </div>
                    </li>

                    <!-- Closed As Lost // -->
                    <li v-if="activity.type === 'closed as lost'" :key="activity.id" class="flex items-start gap-2 p-4">
                        <UAvatar :src="getUserFallbackAvatarUrl({ first_name: 'Farhan', last_name: 'Aziz' })" size="md" />
                        <div class="w-full rounded border p-2">
                            <p class="mb-1 flex items-center gap-2 font-semibold">
                                <UIcon name="i-heroicons-x-circle" class="h-5 w-5 text-black" />
                                <span
                                    >Closed as Lost by {{ getUserFullName(getParticipantByRole(activity, 'author')?.user) }}</span
                                >
                            </p>
                            <div class="text-weak flex items-center gap-1 text-xs">
                                <p>{{ getUserFullName(activity.user) }}</p>
                                &middot;
                                <p>{{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}</p>
                            </div>
                            <p class="text-weak mt-2">Reason: Pricing</p>
                        </div>
                    </li>

                    <!-- Note Activity // -->
                    <li v-if="activity.type === 'note'" :key="activity.id" class="space-y-1 border-b p-4">
                        <UBadge variant="subtle" size="xs" :ui="{ rounded: 'rounded-full' }" class="gap-1">
                            Note
                            <UIcon name="i-heroicons-document-solid" />
                        </UBadge>

                        <div class="flex items-center gap-2">
                            <p class="font-semibold">
                                {{ activity.subject }}
                            </p>
                            <p class="text-slate-400">
                                {{ useDateFormat(activity.created_at, 'DD/MM/YY hh:mm A').value.replace('"', '') }}
                            </p>

                            <div class="ml-auto flex items-center gap-1">
                                <p class="text-xs text-slate-400">{{ getUserFullName(activity.user) }}</p>
                                <UAvatar :src="getUserFallbackAvatarUrl()" size="3xs" />
                            </div>
                        </div>

                        <p v-if="activity.description" class="text-slate-500">{{ activity.description }}</p>
                    </li>

                    <!-- Call Activity -->
                    <li v-if="activity.type === 'calling'" :key="activity.id" class="flex items-start gap-2 p-4">
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
                    </li>

                    <!-- Mail Activity -->
                    <li v-if="activity.type === 'email'" :key="activity.id" class="flex items-start gap-2 p-4">
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
                                Thank you for visiting our Web site. We have forwarded your request for additional information
                                to...
                            </p>
                        </div>
                    </li>

                    <!-- Assigned Activity // -->
                    <li v-if="activity.type === 'assigned'" :key="activity.id" class="flex items-start gap-2 p-4">
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
                    </li>

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
            </ul>
        </div>
    </UCard>
</template>

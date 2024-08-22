<script setup lang="ts">
import { useDateFormat } from '@vueuse/core';
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Activity, ActivityParticipant, ActivityParticipantRoles, Contact, User } from '~/types';

const props = defineProps<{
    lead_id?: number;
    opportunity_id?: number;
}>();
const createMode = ref<'note' | 'email' | undefined>();

interface IActivity extends Activity {
    participants?: (ActivityParticipant & { user?: User | null; contact?: Contact | null })[] | null;
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
    return activity.participants?.find((participant) => participant.role === roleName);
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
            background: 'bg-transparent',
            ring: 'ring-0',
            shadow: 'shadow-none',
            body: {
                padding: 'px-0 py-0 sm:px-0 sm:py-0',
            },
            header: {
                base: 'rounded-t-lg',
                background: 'bg-base-100 shadow-sm',
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
                    size="xs"
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
                    size="xs"
                    :ui="{ rounded: 'rounded-full' }"
                    disabled
                    @click="createMode = 'email'"
                >
                    <template #trailing>
                        <UIcon name="i-heroicons-envelope-solid" class="h-4 w-4" />
                    </template>
                </UButton>
            </div>
        </template>

        <div class="mt-4 space-y-4">
            <!-- Note Create Mode -->
            <UForm
                v-if="createMode === 'note'"
                class="w-full divide-y rounded border bg-base-100"
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

            <ul class="space-y-4">
                <template v-for="activity in activities">
                    <!-- Note Activity -->
                    <li v-if="activity.type === 'note'" :key="activity.id" class="space-y-1 rounded-lg bg-base-100 p-4 shadow-sm">
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
                                <UAvatar :src="getFallbackAvatarUrl(getUserFullName(activity.user))" size="3xs" />
                            </div>
                        </div>

                        <p v-if="activity.description" class="text-slate-500">{{ activity.description }}</p>
                    </li>

                    <!-- Called Activity -->
                    <li
                        v-if="activity.type === 'called'"
                        :key="activity.id"
                        class="space-y-1 rounded-lg bg-base-100 p-4 shadow-sm"
                    >
                        <UBadge variant="subtle" size="xs" color="green" :ui="{ rounded: 'rounded-full' }" class="gap-1">
                            Call
                            <UIcon name="i-heroicons-phone-solid" />
                        </UBadge>

                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-arrow-up-right" class="text-emerald-500" />
                                <p>
                                    Called
                                    <NuxtLink
                                        :href="`/dashboard/customer/contacts/${getParticipantByRole(activity, 'called')?.contact?.id}`"
                                        class="font-semibold text-brand"
                                    >
                                        {{ getUserFullName(getParticipantByRole(activity, 'called')?.contact) }}
                                    </NuxtLink>
                                </p>
                            </div>
                            <p class="text-slate-400">
                                {{ useDateFormat(activity.created_at, 'DD/MM/YY hh:mm A').value.replace('"', '') }}
                            </p>

                            <div class="ml-auto flex items-center gap-1">
                                <p class="text-xs text-slate-400">{{ getUserFullName(activity.user) }}</p>
                                <UAvatar :src="getFallbackAvatarUrl(getUserFullName(activity.user))" size="3xs" />
                            </div>
                        </div>
                    </li>

                    <!-- Incoming Call Activity -->
                    <li
                        v-if="activity.type === 'incoming call'"
                        :key="activity.id"
                        class="space-y-1 rounded-lg bg-base-100 p-4 shadow-sm"
                    >
                        <UBadge variant="subtle" size="xs" color="green" :ui="{ rounded: 'rounded-full' }" class="gap-1">
                            Call
                            <UIcon name="i-heroicons-phone-solid" />
                        </UBadge>

                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-arrow-down-right" class="text-emerald-500" />
                                <p>
                                    Incoming call from
                                    <NuxtLink
                                        :href="`/dashboard/customer/contacts/${getParticipantByRole(activity, 'caller')?.contact?.id}`"
                                        class="font-semibold text-brand"
                                    >
                                        {{ getUserFullName(getParticipantByRole(activity, 'caller')?.contact) }}
                                    </NuxtLink>
                                </p>
                            </div>
                            <p class="text-slate-400">
                                {{ useDateFormat(activity.created_at, 'DD/MM/YY hh:mm A').value.replace('"', '') }}
                            </p>

                            <div class="ml-auto flex items-center gap-1">
                                <p class="text-xs text-slate-400">{{ getUserFullName(activity.user) }}</p>
                                <UAvatar :src="getFallbackAvatarUrl(getUserFullName(activity.user))" size="3xs" />
                            </div>
                        </div>
                    </li>

                    <!-- Attempted to call Activity -->
                    <li
                        v-if="activity.type === 'attempted to call'"
                        :key="activity.id"
                        class="space-y-1 rounded-lg bg-base-100 p-4 shadow-sm"
                    >
                        <UBadge variant="subtle" size="xs" color="red" :ui="{ rounded: 'rounded-full' }" class="gap-1">
                            Call
                            <UIcon name="i-heroicons-phone-solid" />
                        </UBadge>

                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-arrow-down-right" class="text-red-500" />
                                <p>
                                    Attempted to call
                                    <NuxtLink
                                        :href="`/dashboard/customer/contacts/${getParticipantByRole(activity, 'called')?.contact?.id}`"
                                        class="font-semibold text-brand"
                                    >
                                        {{ getUserFullName(getParticipantByRole(activity, 'called')?.contact) }}
                                    </NuxtLink>
                                </p>
                            </div>
                            <p class="text-slate-400">
                                {{ useDateFormat(activity.created_at, 'DD/MM/YY hh:mm A').value.replace('"', '') }}
                            </p>

                            <div class="ml-auto flex items-center gap-1">
                                <p class="text-xs text-slate-400">{{ getUserFullName(activity.user) }}</p>
                                <UAvatar :src="getFallbackAvatarUrl(getUserFullName(activity.user))" size="3xs" />
                            </div>
                        </div>
                    </li>

                    <!-- Missed call Activity -->
                    <li
                        v-if="activity.type === 'missed call'"
                        :key="activity.id"
                        class="space-y-1 rounded-lg bg-base-100 p-4 shadow-sm"
                    >
                        <UBadge variant="subtle" size="xs" color="red" :ui="{ rounded: 'rounded-full' }" class="gap-1">
                            Call
                            <UIcon name="i-heroicons-phone-solid" />
                        </UBadge>

                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-heroicons-arrow-up-right" class="text-red-500" />
                                <p>
                                    Missed call from
                                    <NuxtLink
                                        :href="`/dashboard/customer/contacts/${getParticipantByRole(activity, 'caller')?.contact?.id}`"
                                        class="font-semibold text-brand"
                                    >
                                        {{ getUserFullName(getParticipantByRole(activity, 'caller')?.contact) }}
                                    </NuxtLink>
                                </p>
                            </div>
                            <p class="text-slate-400">
                                {{ useDateFormat(activity.created_at, 'DD/MM/YY hh:mm A').value.replace('"', '') }}
                            </p>

                            <div class="ml-auto flex items-center gap-1">
                                <p class="text-xs text-slate-400">{{ getUserFullName(activity.user) }}</p>
                                <UAvatar :src="getFallbackAvatarUrl(getUserFullName(activity.user))" size="3xs" />
                            </div>
                        </div>
                    </li>

                    <!-- Status Change (updated) -->
                    <li
                        v-if="activity.type === 'updated'"
                        :key="activity.id"
                        class="flex items-center gap-2 rounded-lg bg-base-100 p-4 shadow-sm"
                    >
                        <p class="text-slate-600">{{ activity.subject.split(' from ').at(0) + ' from' }}</p>
                        <UBadge :ui="{ rounded: 'rounded-full' }" class="bg-slate-700 capitalize">
                            {{ activity.subject.split(' from ').at(1)?.split(' to ').at(0) }}
                        </UBadge>
                        <UIcon name="i-heroicons-arrow-long-right" />
                        <UBadge :ui="{ rounded: 'rounded-full' }" class="bg-slate-700 capitalize">
                            {{ activity.subject.split(' from ').at(1)?.split(' to ').at(1) }}
                        </UBadge>
                        <p class="text-slate-400">
                            {{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}
                        </p>
                    </li>

                    <!-- Lead Source -->
                    <li
                        v-if="activity.type === 'lead created'"
                        :key="activity.id"
                        class="flex items-center gap-2 rounded-lg bg-base-100 p-4 shadow-sm"
                    >
                        <p class="text-slate-600">Lead created - Source</p>
                        <UBadge variant="soft" :ui="{ rounded: 'rounded-full' }" class="capitalize">
                            {{ activity.subject.toLowerCase().split('source ')?.at(1) ?? '---' }}
                        </UBadge>
                        <p class="text-slate-400">
                            {{ useDateFormat(activity.created_at, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}
                        </p>
                    </li>
                </template>
            </ul>
        </div>
    </UCard>
</template>

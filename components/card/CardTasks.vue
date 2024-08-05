<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';
import type { Task, User } from '~/types';

const props = defineProps<{
    lead_id?: number;
    opportunity_id?: number;
    tasks: (Pick<Task, 'id' | 'description' | 'date' | 'is_completed'> & { user?: User | null })[];
}>();

const { user: currentUser } = storeToRefs(userSessionStore());
if (!currentUser.value) throw createError({ status: 401, message: 'Unauthorized' });

const { data: usersOption } = await useLazyFetch(`/api/organizations/${currentUser.value.user_metadata.organization_id}/users`, {
    key: `organizations-${currentUser.value.user_metadata.organization_id}-users`,
    transform: (users) =>
        users.map((user) => ({
            value: user.id,
            label: `${getUserFullName(user)} ${currentUser.value!.id === user.id ? '(You)' : ''}`,
        })),
    default: () => [],
});

const isCreatingTask = ref(false);

const initialState = {
    description: '',
    date: undefined,
    user_id: '',
    lead_id: props.lead_id,
    opportunity_id: props.opportunity_id,
};
const state = ref({ ...initialState });
const isSubmitting = ref(false);

type AddTaskType = z.infer<typeof addTaskSchema>;
async function handleSubmit(event: FormSubmitEvent<AddTaskType>) {
    try {
        isSubmitting.value = true;

        await $fetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(event.data),
        });

        toast.success('Task added successfully.');
        await refreshNuxtData();
        state.value = { ...initialState };
        isCreatingTask.value = false;
    } catch (e) {
        console.error('Failed to add task', e);
        toast.error('Failed to add task, please try again later.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <UCard :ui="{ body: { padding: 'px-0 py-0 sm:p-0' } }">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-slate-700">
                    Tasks <span v-if="!!tasks.length">({{ tasks.length }})</span>
                </h2>
                <UButton variant="ghost" square color="black" :padded="false" @click="isCreatingTask = !isCreatingTask">
                    <UIcon name="i-heroicons-plus" class="h-6 w-6" />
                </UButton>
            </div>
        </template>

        <div v-if="isCreatingTask" class="bg-brand-50 p-4">
            <LazyUForm :schema="addTaskSchema" :state="state" class="space-y-3" @submit="handleSubmit" @error="console.error">
                <UFormGroup label="Task Description" name="description" required>
                    <UInput v-model="state.description" :disabled="isSubmitting" placeholder="Enter company name" />
                </UFormGroup>

                <UFormGroup label="Date" name="date" required>
                    <UInput v-model.date="state.date" type="datetime-local" :disabled="isSubmitting" />
                </UFormGroup>

                <UFormGroup label="Assign User" name="user_id" required>
                    <USelectMenu
                        v-model="state.user_id"
                        value-attribute="value"
                        :options="usersOption"
                        searchable
                        searchable-placeholder="Search a user..."
                        :disabled="isSubmitting"
                        placeholder="Select user"
                    />
                </UFormGroup>

                <div class="grid grid-cols-2 gap-2">
                    <UButton
                        type="button"
                        variant="ghost"
                        color="black"
                        :disabled="isSubmitting"
                        block
                        @click="isCreatingTask = false"
                    >
                        Cancel
                    </UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting" block>Save</UButton>
                </div>
            </LazyUForm>
        </div>

        <div v-if="!!tasks?.length" class="divide-y">
            <LazyCardTask v-for="task in tasks" :key="task.id" :task="task" :lead_id="lead_id" :opportunity_id="opportunity_id" />
        </div>

        <UButton
            v-if="!(isCreatingTask || tasks?.length > 0)"
            variant="ghost"
            color="black"
            block
            class="justify-start text-slate-700"
            @click="isCreatingTask = true"
        >
            Add New Task
        </UButton>
    </UCard>
</template>

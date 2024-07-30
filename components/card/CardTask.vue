<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { Task, User } from '~/types';
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const props = defineProps<{
    task: Pick<Task, 'id' | 'description' | 'date' | 'is_completed'> & { user: User | null };
    opportunity_id?: number;
    lead_id?: number;
}>();

const isEditingMode = ref(false);
const isUpdating = ref(false);

const { taskState, updateTask } = useUpdateTask();

async function completeTask() {
    try {
        isUpdating.value = true;

        await $fetch(`/api/tasks/${props.task.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                id: props.task.id,
                is_completed: true,
                opportunity_id: props.opportunity_id,
                lead_id: props.lead_id,
            }),
        });

        toast.success('Task completed successfully');
        await refreshNuxtData();
    } catch (error) {
        console.error('Error updating task status', error);
        toast.error('Failed to complete task, please try again later.');
    } finally {
        isUpdating.value = false;
    }
}
async function deleteTask() {
    try {
        isUpdating.value = true;

        await $fetch(`/api/tasks/${props.task.id}`, {
            method: 'DELETE',
            body: JSON.stringify({ id: props.task.id }),
        });

        toast.success('Task deleted successfully');
        await refreshNuxtData();
    } catch (error) {
        console.error('Error deleting task', error);
        toast.error('Failed to delete task, please try again later.');
    } finally {
        isUpdating.value = false;
    }
}
function useUpdateTask() {
    type UpdateTaskType = z.infer<typeof updateTaskSchema>;
    const taskState = ref({
        id: props.task.id,
        description: props.task.description,
        date: props.task.date,
    });

    async function updateTask(event: FormSubmitEvent<UpdateTaskType>) {
        try {
            isUpdating.value = true;

            await $fetch(`/api/tasks/${props.task.id}`, {
                method: 'PUT',
                body: JSON.stringify(event.data),
            });

            toast.success('Task updated successfully');
            isEditingMode.value = false;
            await refreshNuxtData();
        } catch (error) {
            console.error('Error updating task', error);
            toast.error('Failed to update task, please try again later.');
        } finally {
            isUpdating.value = false;
        }
    }

    return { taskState, updateTask };
}
</script>

<template>
    <div class="group px-4 py-2 hover:bg-base-200" :class="[isEditingMode ? 'bg-brand-50 hover:bg-brand-50' : '']">
        <div class="flex justify-between">
            <div class="flex items-center gap-4">
                <UAvatar :src="task.user?.photo ?? getUserFallbackAvatarUrl(task.user)" size="md" />

                <div class="flex flex-col">
                    <span class="font-semibold" :class="{ 'line-through': props.task.is_completed }">{{ task.description }}</span>
                    <span class="text-weak text-xs">
                        {{ task.user?.email }} &#128900;
                        {{ useDateFormat(task.date, 'DD/MM/YYYY hh:mm A').value.replace('"', '') }}
                    </span>
                </div>
            </div>

            <div v-if="props.task.is_completed" class="flex items-center justify-center gap-2">
                <UButton
                    variant="ghost"
                    square
                    icon="i-heroicons-trash"
                    color="gray"
                    size="2xs"
                    class="hidden group-hover:flex"
                    :disabled="isUpdating"
                    @click="deleteTask"
                />
                <UIcon name="i-heroicons-check-circle" class="h-4 w-4 text-green-700" />
            </div>
            <div v-if="!props.task.is_completed && !isEditingMode" class="flex items-center gap-2">
                <UButton
                    variant="ghost"
                    square
                    icon="i-heroicons-trash"
                    color="black"
                    size="2xs"
                    class="hidden group-hover:flex"
                    :disabled="isUpdating"
                    @click="deleteTask"
                />
                <UButton
                    variant="ghost"
                    square
                    icon="i-heroicons-pencil"
                    color="black"
                    size="2xs"
                    class="hidden group-hover:flex"
                    :disabled="isUpdating"
                    @click="isEditingMode = true"
                />
                <UButton
                    variant="ghost"
                    square
                    icon="i-heroicons-check"
                    color="black"
                    size="2xs"
                    :disabled="isUpdating"
                    @click="completeTask"
                />
            </div>
        </div>

        <LazyUForm
            v-if="isEditingMode"
            :schema="updateTaskSchema"
            :state="taskState"
            class="my-4 space-y-3"
            @submit="updateTask"
            @error="console.error"
        >
            <UFormGroup label="Task Description" name="description" required>
                <UInput
                    v-model="taskState.description"
                    :disabled="isUpdating"
                    :loading="isUpdating"
                    placeholder="Enter company name"
                />
            </UFormGroup>

            <UFormGroup label="Date" name="date" required>
                <UInput v-model="taskState.date" type="datetime-local" :disabled="isUpdating" :loading="isUpdating" />
            </UFormGroup>

            <div class="flex items-center justify-end gap-2">
                <UButton type="button" variant="outline" :disabled="isUpdating" @click="isEditingMode = false">Cancel</UButton>
                <UButton type="submit" :disabled="isUpdating" :loading="isUpdating">Save</UButton>
            </div>
        </LazyUForm>
    </div>
</template>

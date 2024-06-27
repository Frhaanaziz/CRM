<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { Company, User } from '~/types';

const props = defineProps<{
    company: Pick<Company, 'id'>;
    userId?: User['id'];
}>();
const emit = defineEmits(['close']);
const closeModal = () => emit('close');

const currentUser = useSupabaseUser();
if (!currentUser.value) throw createError({ status: 401, message: 'Unauthorized' });
if (!currentUser.value.user_metadata.organization_id) throw createError({ status: 403, message: 'User Organization Not Found' });

const { data: users } = await useLazyFetch(`/api/organizations/${currentUser.value.user_metadata.organization_id}/users`);
const usersOption = computed(() => {
    return (
        users.value?.map((user) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name} ${currentUser.value!.id === user.id ? '(You)' : ''}`,
        })) ?? []
    );
});

type UpdateCompanyUserId = z.infer<typeof updateCompanyUserIdSchema>;
const isSubmitting = ref(false);
const state = ref({
    id: props.company.id,
    user_id: props.userId,
});
async function handleSubmit(event: FormSubmitEvent<UpdateCompanyUserId>) {
    try {
        isSubmitting.value = true;

        await $fetch(`/api/companies/${props.company.id}/user-id`, {
            method: 'PATCH',
            body: JSON.stringify(event.data),
        });

        closeModal();
        await refreshNuxtData(`company-${props.company.id}`);
    } catch (e) {
        console.error(e);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <UModal
        :ui="{
            width: 'sm:max-w-md',
        }"
    >
        <div class="flex items-center justify-between p-3">
            <p class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Assign Company</p>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>

        <div class="space-y-3 bg-base-200 p-3">
            <p class="text-weak">You will change the ownership of this company to a user.</p>

            <UForm
                :schema="updateCompanyUserIdSchema"
                :state="state"
                class="space-y-3"
                @submit="handleSubmit"
                @error="console.error"
            >
                <UFormGroup label="Choose User" name="user_id" required>
                    <USelectMenu
                        v-model="state.user_id"
                        value-attribute="value"
                        option-attribute="label"
                        :options="usersOption"
                        searchable
                        searchable-placeholder="Search a user..."
                        :loading="isSubmitting"
                        :disabled="isSubmitting"
                        placeholder="Select contact"
                    />
                </UFormGroup>

                <div class="flex items-center justify-end gap-2">
                    <UButton type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">Cancel</UButton>
                    <UButton type="submit" :disabled="isSubmitting" :loading="isSubmitting">Save</UButton>
                </div>
            </UForm>
        </div>
    </UModal>
</template>

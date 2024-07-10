<script setup lang="ts">
const createMode = ref<'call' | 'note' | 'email' | undefined>();
const { user } = storeToRefs(userSessionStore());
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
                disabled
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
            <!-- Call Create Mode -->
            <div v-if="createMode === 'call'" class="flex items-start gap-2">
                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                <div class="w-full divide-y rounded border">
                    <p class="m-2 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-phone" class="h-5 w-5 text-black" />
                        <span>New Call</span>
                    </p>
                    <p class="flex items-center gap-2 bg-base-300 p-2">
                        <span class="font-semibold">From</span>
                        <span>{{ `${user?.user_metadata?.first_name ?? ''} ${user?.user_metadata?.last_name ?? ''}` }}</span>
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

            <!-- Note Activity -->
            <div class="flex items-start gap-2">
                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                <div class="w-full rounded border p-2">
                    <p class="mb-1 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-clipboard" class="h-5 w-5 text-black" />
                        <span>Note: Lily have concern about the Price</span>
                    </p>
                    <div class="text-weak flex items-center gap-1 text-xs">
                        <p>Andy Brune</p>
                        &middot;
                        <p>2/12/2024 3:33 AM</p>
                    </div>
                    <p class="text-weak mt-2">Discuss with team about how to reduce the price.</p>
                </div>
            </div>

            <!-- Call Activity -->
            <div class="flex items-start gap-2">
                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                <div class="w-full rounded border p-2">
                    <p class="mb-1 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-phone" class="h-5 w-5 text-black" />
                        <span>Subject: Introduction call with Lilly</span>
                    </p>
                    <div class="text-weak flex items-center gap-1 text-xs">
                        <p>Andy Brune</p>
                        &middot;
                        <p>2/12/2024 3:33 AM</p>
                    </div>
                    <p class="text-weak mt-2">Discuss our services</p>
                </div>
            </div>

            <!-- Mail Activity -->
            <div class="flex items-start gap-2">
                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                <div class="w-full rounded border p-2">
                    <p class="mb-1 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-envelope" class="h-5 w-5 text-black" />
                        <span>Subject: Thank you for your interest</span>
                    </p>
                    <div class="text-weak flex items-center gap-1 text-xs">
                        <p>Andy Brune</p>
                        &middot;
                        <p>2/12/2024 3:33 AM</p>
                    </div>
                    <p class="text-weak mt-2">Dear Lilly Pyles,</p>
                    <p class="text-weak">
                        Thank you for visiting our Web site. We have forwarded your request for additional information to...
                    </p>
                </div>
            </div>

            <!-- Mail Activity -->
            <div class="flex items-start gap-2">
                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                <div class="w-full rounded border p-2">
                    <p class="mb-1 flex items-center gap-2 font-semibold">
                        <UIcon name="i-heroicons-user" class="h-5 w-5 text-black" />
                        <span>Leotan Assigned this lead to Andy</span>
                    </p>
                    <div class="text-weak flex items-center gap-1 text-xs">
                        <p>Leotan Adhitya</p>
                        &middot;
                        <p>2/12/2024 3:33 AM</p>
                    </div>
                </div>
            </div>

            <!-- Mail Activity -->
            <div class="flex items-start gap-2">
                <UAvatar :src="'/images/avatar-fallback.jpg'" size="md" />
                <div class="">
                    <div class="text-weak flex w-full items-center gap-1 rounded border p-2">
                        <p class="text-sm">Lead Source - <span class="font-semibold">Hubspot</span></p>
                        &middot;
                        <p class="text-xs">2/12/2024 3:33 AM</p>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { VerticalNavigationLink } from '#ui/types';

const emit = defineEmits(['close']);

const { user } = storeToRefs(userSessionStore());

defineProps<{
    links: VerticalNavigationLink[] | VerticalNavigationLink[][];
}>();

const route = useRoute();
const pathname = ref(route.path);
watchEffect(() => (pathname.value = route.path));
</script>

<template>
    <div class="p-4">
        <NuxtImg class="h-4 w-auto" src="/logo.svg" alt="Pipeline logo" />
    </div>
    <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
                <UVerticalNavigation
                    :links
                    :ui="{
                        inactive: 'text-gray-600',
                        icon: {
                            active: 'text-gray-900',
                            inactive: 'text-gray-500',
                        },
                    }"
                />
            </li>

            <li class="mt-auto space-y-2">
                <UVerticalNavigation
                    :links="[
                        {
                            label: 'Settings',
                            to: '/dashboard/settings',
                            icon: 'i-heroicons-cog-6-tooth',
                            active: pathname.startsWith('/dashboard/settings'),
                            click: () => emit('close'),
                        },
                        // {
                        //     label: 'Help & Support',
                        //     to: '/dashboard/support',
                        //     icon: 'i-heroicons-wrench-screwdriver',
                        //     active: pathname.startsWith('/dashboard/support'),
                        //     click: () => emit('close'),
                        // },
                    ]"
                    :ui="{
                        inactive: 'text-gray-600',
                        icon: {
                            active: 'text-gray-900',
                            inactive: 'text-gray-500',
                        },
                    }"
                />
                <div v-if="user" class="flex items-center gap-x-3 border-t px-3 py-2">
                    <UAvatar
                        :src="user.user_metadata?.photo ?? getFallbackAvatarUrl(getUserFullName(user.user_metadata))"
                        icon="i-heroicons-photo"
                        :alt="`${user.user_metadata.first_name} Avatar`"
                        size="xs"
                    />

                    <p>{{ truncateString(getUserFullName(user.user_metadata), 20) }}</p>
                </div>
            </li>
        </ul>
    </nav>
</template>

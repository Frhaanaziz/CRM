<script setup lang="ts">
const emit = defineEmits(['close']);

const { user } = storeToRefs(userSessionStore());

defineProps<{
    navigations: { name: string; links: { name: string; href: string; icon: string; current: boolean }[] }[];
}>();

const route = useRoute();
const pathname = ref(route.path);
watchEffect(() => (pathname.value = route.path));
</script>

<template>
    <div class="flex h-16 shrink-0 items-center">
        <NuxtImg class="h-6 w-auto" src="/logo.svg" alt="Pipeline logo" />
    </div>
    <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
                <ul role="list" class="-mx-2 space-y-5">
                    <li v-for="navigation in navigations" :key="navigation.name">
                        <p class="text-weak mb-1.5 text-xs font-semibold">{{ navigation.name }}</p>
                        <ul class="space-y-1.5">
                            <li v-for="link in navigation.links" :key="link.href">
                                <NuxtLink
                                    :href="link.href"
                                    class="text-weak flex items-center gap-x-2 rounded p-2 text-sm leading-6 transition"
                                    :class="[
                                        link.current
                                            ? 'border-l-4 border-l-brand'
                                            : 'border-l-4 border-l-transparent hover:border-l-brand',
                                    ]"
                                    @click="emit('close')"
                                >
                                    <UIcon :name="link.icon" class="text-weak h-5 w-5 shrink-0" aria-hidden="true" />
                                    {{ link.name }}
                                </NuxtLink>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li class="-mx-6 mt-auto">
                <NuxtLink
                    href="/dashboard/settings"
                    class="text-weak mx-4 flex gap-x-3 rounded p-2 text-sm font-semibold leading-6 transition"
                    :class="[
                        pathname.startsWith('/dashboard/settings')
                            ? 'border-l-4 border-l-brand'
                            : 'border-l-4 border-l-transparent hover:border-l-brand',
                    ]"
                    @click="emit('close')"
                >
                    <UIcon name="i-heroicons-cog-6-tooth" class="text-weak h-6 w-6 shrink-0" aria-hidden="true" />
                    Settings
                </NuxtLink>
                <div v-if="user" class="flex items-center gap-x-3 px-6 py-3 text-xs font-semibold leading-6">
                    <UAvatar
                        :src="user.user_metadata?.photo ?? getUserFallbackAvatarUrl(user.user_metadata)"
                        icon="i-heroicons-photo"
                        :alt="`${user.user_metadata.first_name} Avatar`"
                    />

                    <div>
                        <p>{{ truncateString(getUserFullName(user.user_metadata), 20) }}</p>
                        <p class="text-weak text-xs font-normal">
                            {{ truncateString(user?.email ?? '', 20) }}
                        </p>
                    </div>
                </div>
            </li>
            <!-- <li class="-mx-6 mt-auto">
                <button
                    class="mx-4 flex items-center gap-x-2 rounded p-2 text-sm font-semibold text-red-500"
                    @click="
                        () => {
                            openLogOutModal();
                            emit('close');
                        }
                    "
                >
                    <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span>Sign out</span>
                </button>
                <div v-if="user" class="flex items-center gap-x-3 px-6 py-3 text-xs font-semibold leading-6">
                    <UAvatar
                        :src="user.user_metadata?.photo ?? 'getUserFallbackAvatarUrl(user.user_metadata)"
                        icon="i-heroicons-photo"
                        :alt="`${user.user_metadata.first_name} Avatar`"
                    />

                    <div>
                        <p>{{ truncateString(`${user.user_metadata?.first_name} ${user.user_metadata.last_name}`, 20) }}</p>
                        <p class="text-weak text-xs font-normal">
                            {{ truncateString(user?.email ?? '', 20) }}
                        </p>
                    </div>
                </div>
            </li> -->
        </ul>
    </nav>
</template>

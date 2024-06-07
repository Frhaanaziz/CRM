<script setup lang="ts">
import LazyModalSignOut from '~/components/modal/ModalSignOut.vue';
const route = useRoute();
const pathname = ref(route.path);

watch(
    () => route.path,
    () => (pathname.value = route.path)
);

const navigation = computed(() => {
    const isCurrent = (path: string) =>
        pathname.value.replace('/dashboard', '') === path;

    return [
        {
            name: 'Dashboard',
            href: '/dashboard/',
            icon: 'i-heroicons-home',
            current: isCurrent('/'),
        },
        {
            name: 'Companies',
            href: '/dashboard/companies',
            icon: 'i-heroicons-user',
            current: isCurrent('/companies'),
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: 'i-heroicons-cog-6-tooth',
            current: isCurrent('/settings'),
        },
    ];
});

const modal = useModal();
function openLogOutModal() {
    modal.open(LazyModalSignOut, {
        onClose: () => modal.close(),
    });
}
</script>

<template>
    <div class="flex h-16 shrink-0 items-center">
        <NuxtImg class="h-6 w-auto" src="/logo.svg" alt="Pipeline logo" />
    </div>
    <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
                <ul role="list" class="-mx-2 space-y-1">
                    <li v-for="item in navigation" :key="item.name">
                        <NuxtLink
                            :href="item.href"
                            :class="[
                                item.current
                                    ? 'border-l-4 border-l-brand'
                                    : 'border-l-4 border-l-transparent hover:border-l-brand',
                                'transition text-weak flex gap-x-3 rounded p-2 text-sm leading-6 font-semibold',
                            ]"
                        >
                            <UIcon
                                :name="item.icon"
                                class="h-6 w-6 shrink-0 text-weak"
                                aria-hidden="true"
                            />
                            {{ item.name }}
                        </NuxtLink>
                    </li>
                </ul>
            </li>
            <li class="-mx-6 mt-auto">
                <button
                    class="flex gap-x-2 items-center rounded p-2 mx-4 text-sm font-semibold text-red-500"
                    @click="openLogOutModal"
                >
                    <UIcon
                        name="i-heroicons-arrow-left-start-on-rectangle"
                        class="h-6 w-6 shrink-0"
                        aria-hidden="true"
                    />
                    <span>Sign out</span>
                </button>
                <div
                    href="#"
                    class="flex items-center gap-x-3 px-6 py-3 text-sm font-semibold leading-6"
                >
                    <UAvatar
                        :src="
                            $auth?.user?.picture ??
                            '/images/avatar-fallback.jpg'
                        "
                        icon="i-heroicons-photo"
                        alt="Avatar"
                    />

                    <div>
                        <p>{{ `${$auth?.user?.given_name}` }}</p>
                        <p class="text-sm text-weak font-normal">
                            {{ $auth?.user?.email }}
                        </p>
                    </div>
                </div>
            </li>
        </ul>
    </nav>
</template>

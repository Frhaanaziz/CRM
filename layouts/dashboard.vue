<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

const sidebarOpen = ref(false);
const { user } = userSessionStore();
const route = useRoute();
const pathname = ref(route.path);

watch(
    () => route.path,
    () => (pathname.value = route.path),
);

const navigation = computed(() => {
    const isCurrent = (path: string) => pathname.value.replace('/dashboard', '') === path;

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
            children: [
                {
                    id: 1,
                    name: null,
                    links: [
                        {
                            name: 'Account',
                            href: '/dashboard/settings',
                            current: isCurrent('/settings'),
                        },
                    ],
                },
                {
                    id: 2,
                    name: 'Organization',
                    links: [
                        {
                            name: 'General',
                            href: '/dashboard/settings/organization/general',
                            current: isCurrent('/settings/organization/general'),
                        },
                        {
                            name: 'Team Management',
                            href: '/dashboard/settings/organization/team',
                            current: isCurrent('/settings/organization/team'),
                        },
                    ],
                },
                {
                    id: 3,
                    name: 'Connect',
                    links: [
                        {
                            name: 'Integrations',
                            href: '/dashboard/settings/connect/integrations',
                            current: isCurrent('/settings/connect/integrations'),
                        },
                        {
                            name: 'Developer',
                            href: '/dashboard/settings/connect/developer',
                            current: isCurrent('/settings/connect/developer'),
                        },
                    ],
                },
            ],
        },
    ];
});
const currentNavigation = computed(() => navigation.value.find((item) => item.current));
</script>

<template>
    <div>
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
                <TransitionChild
                    as="template"
                    enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-gray-900/80" />
                </TransitionChild>

                <div class="fixed inset-0 flex">
                    <TransitionChild
                        as="template"
                        enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full"
                        enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leave-from="translate-x-0"
                        leave-to="-translate-x-full"
                    >
                        <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                            <TransitionChild
                                as="template"
                                enter="ease-in-out duration-300"
                                enter-from="opacity-0"
                                enter-to="opacity-100"
                                leave="ease-in-out duration-300"
                                leave-from="opacity-100"
                                leave-to="opacity-0"
                            >
                                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                                        <span class="sr-only">Close sidebar</span>
                                        <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </TransitionChild>

                            <!-- Sidebar component, swap this element with another sidebar if you like -->
                            <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-base-200 px-6 pb-2">
                                <DashboardSidebar :navigation="navigation" @close="sidebarOpen = false" />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Static sidebar for desktop -->
        <!-- <div class="hidden gap-y-5 overflow-y-auto bg-base-200 px-6 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col"> -->
        <div class="hidden gap-y-5 bg-base-200 px-6 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col">
            <DashboardSidebar :navigation="navigation" />
        </div>

        <div class="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
            <button class="-m-2.5 flex items-center p-2.5 lg:hidden" @click="sidebarOpen = true">
                <span class="sr-only">Open sidebar</span>
                <UIcon name="i-heroicons-bars-3" class="h-6 w-6" aria-hidden="true" />
            </button>
            <div class="flex-1 text-sm font-semibold leading-6">Dashboard</div>
            <NuxtLink v-if="user" href="/dashboard/settings">
                <span class="sr-only">Your profile</span>
                <NuxtImg
                    class="rounded-full bg-gray-50"
                    :src="user?.user_metadata?.photo ?? '/images/avatar-fallback.jpg'"
                    :alt="`${user.user_metadata?.first_name} Avatar`"
                    width="32"
                    height="32"
                />
            </NuxtLink>
        </div>

        <main :class="[currentNavigation?.children ? 'lg:pl-96' : 'lg:pl-48']">
            <slot />
        </main>

        <nav
            v-if="currentNavigation?.children"
            class="fixed inset-y-0 left-48 hidden w-48 overflow-y-auto border-l bg-base-200 py-14 lg:block lg:px-3"
        >
            <ul class="divide-y-2 text-sm">
                <li v-for="navigationLinks in currentNavigation.children" :key="navigationLinks.id" class="py-5">
                    <p v-if="navigationLinks.name" class="text-xs font-semibold">{{ navigationLinks.name }}</p>
                    <div class="flex flex-col">
                        <NuxtLink
                            v-for="link in navigationLinks.links"
                            :key="link.href"
                            :href="link.href"
                            class="py-3 transition-colors hover:text-brand"
                            :class="[link.current ? 'text-brand' : '']"
                        >
                            {{ link.name }}
                        </NuxtLink>
                    </div>
                </li>
            </ul>
        </nav>
    </div>
</template>

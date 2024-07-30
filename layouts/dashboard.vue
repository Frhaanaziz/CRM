<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

const { user } = storeToRefs(userSessionStore());

const route = useRoute();
const pathname = ref(route.path);
watchEffect(() => (pathname.value = route.path));

const sidebarOpen = ref(false);

const navigations = computed(() => {
    const isCurrent = (path: string) => pathname.value === path;
    const isCurrentNested = (path: string) => pathname.value.startsWith(path);

    return [
        {
            name: 'My Work',
            links: [
                {
                    name: 'Inbox',
                    href: '/dashboard/inbox',
                    icon: 'i-heroicons-inbox',
                    current: isCurrentNested('/dashboard/inbox'),
                },
                // {
                //     name: 'Dashboard',
                //     href: '/dashboard/',
                //     icon: 'i-heroicons-home',
                //     current: isCurrent('/dashboard/'),
                // },
            ],
        },
        {
            name: 'Activity',
            links: [
                {
                    name: 'Reports',
                    href: '/dashboard/activity/reports',
                    icon: 'i-heroicons-document-chart-bar',
                    current: isCurrentNested('/dashboard/activity/reports'),
                },
            ],
        },
        {
            name: 'Pipeline',
            links: [
                {
                    name: 'Leads',
                    href: '/dashboard/pipeline/leads',
                    icon: 'i-heroicons-users',
                    current: isCurrentNested('/dashboard/pipeline/leads'),
                },
                {
                    name: 'Opportunities',
                    href: '/dashboard/pipeline/opportunities',
                    icon: 'i-heroicons-user-plus',
                    current: isCurrentNested('/dashboard/pipeline/opportunities'),
                },
            ],
        },
        {
            name: 'Customer',
            links: [
                {
                    name: 'Contacts',
                    href: '/dashboard/customer/contacts',
                    icon: 'i-heroicons-user-circle',
                    current: isCurrentNested('/dashboard/customer/contacts'),
                },
                {
                    name: 'Companies',
                    href: '/dashboard/customer/companies',
                    icon: 'i-heroicons-user',
                    current: isCurrentNested('/dashboard/customer/companies'),
                },
            ],
        },
        {
            name: 'Resources',
            links: [
                {
                    name: 'B2B Database',
                    href: '/dashboard/resources/b2b-database',
                    icon: 'i-heroicons-circle-stack',
                    current: isCurrentNested('/dashboard/resources/b2b-database'),
                },
            ],
        },
    ];
});
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
                                <DashboardSidebar :navigations="navigations" @close="sidebarOpen = false" />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Static sidebar for desktop -->
        <div class="hidden gap-y-5 bg-base-200 px-6 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col">
            <DashboardSidebar :navigations="navigations" />
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
                    :src="user?.user_metadata?.photo ?? getUserFallbackAvatarUrl(user.user_metadata)"
                    :alt="`${user.user_metadata?.first_name} Avatar`"
                    width="32"
                    height="32"
                />
            </NuxtLink>
        </div>

        <main class="lg:pl-48">
            <slot />
        </main>
    </div>
</template>

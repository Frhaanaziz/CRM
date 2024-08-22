<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import type { VerticalNavigationLink } from '#ui/types';

const { user } = storeToRefs(userSessionStore());

const route = useRoute();
const pathname = ref(route.path);
watchEffect(() => (pathname.value = route.path));

const sidebarOpen = ref(false);

const links = computed(() => {
    const isCurrentNested = (path: string) => pathname.value.startsWith(path);

    return [
        {
            label: 'Inbox',
            to: '/dashboard/inbox',
            icon: 'i-heroicons-inbox',
            active: isCurrentNested('/dashboard/inbox'),
        },
        {
            label: 'Leads',
            to: '/dashboard/pipeline/leads',
            icon: 'i-heroicons-building-office',
            active: isCurrentNested('/dashboard/pipeline/leads'),
        },
        {
            label: 'Opportunities',
            to: '/dashboard/pipeline/opportunities',
            icon: 'i-heroicons-trophy',
            active: isCurrentNested('/dashboard/pipeline/opportunities'),
        },
        {
            label: 'Contacts',
            to: '/dashboard/customer/contacts',
            icon: 'i-heroicons-user-circle',
            active: isCurrentNested('/dashboard/customer/contacts'),
        },
        {
            label: 'Reports',
            to: '/dashboard/activity/reports',
            icon: 'i-heroicons-document-chart-bar',
            active: isCurrentNested('/dashboard/activity/reports'),
        },
        {
            label: 'Company Database',
            to: '/dashboard/resources/b2b-database',
            icon: 'i-heroicons-magnifying-glass-plus',
            active: isCurrentNested('/dashboard/resources/b2b-database'),
        },
    ] satisfies VerticalNavigationLink[];
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
                            <div class="flex grow flex-col overflow-y-auto bg-base-100 px-3 py-2">
                                <DashboardSidebar :links @close="sidebarOpen = false" />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Static sidebar for desktop -->
        <div class="hidden border-r px-3 py-2 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col">
            <DashboardSidebar :links />
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
                    :src="user?.user_metadata?.photo ?? getFallbackAvatarUrl(getUserFullName(user.user_metadata))"
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

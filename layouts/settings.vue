<script setup lang="ts">
const route = useRoute();
const pathname = ref(route.path);

watch(
    () => route.path,
    () => (pathname.value = route.path),
);

const navigations = computed(() => {
    const isCurrent = (path: string) => pathname.value.replace('/dashboard', '') === path;

    return [
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
    ];
});
</script>

<template>
    <div>
        <nav class="fixed inset-y-0 left-48 hidden w-48 overflow-y-auto border-l bg-base-200 py-14 lg:block lg:px-3">
            <ul class="divide-y-2 text-sm">
                <li v-for="navigationLinks in navigations" :key="navigationLinks.id" class="py-5">
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

        <div class="lg:pl-48">
            <slot />
        </div>
    </div>
</template>

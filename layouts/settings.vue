<script setup lang="ts">
import LazyModalSignOut from '~/components/modal/ModalSignOut.vue';

const modal = useModal();

const route = useRoute();
const pathname = ref(route.path);
watchEffect(() => (pathname.value = route.path));

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
                    name: 'Twilio',
                    href: '/dashboard/settings/connect/twilio',
                    current: isCurrent('/settings/connect/twilio'),
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
                <li class="py-5">
                    <button
                        class="py-3 transition-colors hover:text-brand"
                        @click="
                            modal.open(LazyModalSignOut, {
                                onClose: () => modal.close(),
                            })
                        "
                    >
                        Log out
                    </button>
                </li>
            </ul>
        </nav>

        <div class="lg:pl-48">
            <slot />
        </div>
    </div>
</template>

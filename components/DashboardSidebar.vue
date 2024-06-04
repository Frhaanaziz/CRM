<script setup lang="ts">
const pathname = useRoute().path

const isCurrent = (path: string) =>
    pathname.replace('/dashboard', '') === path

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'i-heroicons-home', current: isCurrent('/') },
    { name: 'Companies', href: '/dashboard/companies', icon: 'i-heroicons-user', current: isCurrent('/companies') },
    { name: 'Projects', href: '#', icon: 'i-heroicons-folder', current: isCurrent('/') },
    { name: 'Calendar', href: '#', icon: 'i-heroicons-calendar', current: isCurrent('/') },
    { name: 'Documents', href: '#', icon: 'i-heroicons-document-duplicate', current: isCurrent('/') },
    { name: 'Reports', href: '#', icon: 'i-heroicons-chart-pie', current: isCurrent('/') },
]

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
                        <NuxtLink :href="item.href"
                            :class="[item.current ? 'border-l-4 border-l-brand' : 'border-l-4 border-l-transparent hover:border-l-brand', 'transition text-weak flex gap-x-3 rounded p-2 text-sm leading-6 font-semibold']">
                            <UIcon :name="item.icon" class="h-6 w-6 shrink-0 text-weak" aria-hidden="true" />
                            {{ item.name }}
                        </NuxtLink>
                    </li>
                </ul>
            </li>
            <li class="-mx-6 mt-auto">
                <NuxtLink to="/api/logout" external
                    class="flex gap-x-2 items-center rounded p-2 mx-4 text-sm font-semibold text-red-500">
                    <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="h-6 w-6 shrink-0 "
                        aria-hidden="true" />
                    Log out
                </NuxtLink>
                <a href="#" class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6">
                    <NuxtImg class="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="" />
                    <span class="sr-only">Your profile</span>
                    <span aria-hidden="true">Tom Cook</span>
                </a>
            </li>
        </ul>
    </nav>
</template>
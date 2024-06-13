<template>
    <main class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section class="relative overflow-hidden p-14 text-base-100">
            <img class="absolute -top-52 left-0 -z-[1] h-[50rem]" alt="" src="/bg/rectangle-35.svg" />

            <NuxtImg src="/icons/logo.svg" alt="pipeline" height="32" />
            <p class="mt-8 text-4xl">Close More Deals Seamlessly</p>
        </section>

        <slot />
    </main>
</template>

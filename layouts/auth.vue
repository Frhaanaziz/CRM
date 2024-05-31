<template>
    <main class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <section class="overflow-hidden relative p-14 text-base-100">
            <img class="absolute -z-[1] -top-52 left-0 h-[50rem]" alt="" src="/bg/rectangle-35.svg">

            <NuxtImg src="/icons/logo.svg" alt="pipeline" height="32" />
            <p class="mt-8 text-4xl">Close More Deals Seamlessly</p>
        </section>


        <slot />
    </main>
</template>

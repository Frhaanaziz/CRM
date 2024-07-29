<template>
    <div class="p-7">
        <div class="mb-7 flex items-center justify-between">
            <h1 class="text-2xl font-semibold">Integrations</h1>
            <UButton>
                <span>Request an Integration</span>
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
            </UButton>
        </div>

        <section class="grid grid-cols-4 gap-5">
            <div class="flex items-center gap-3 rounded border p-2">
                <NuxtImg src="/icons/linkedin.svg" width="72" height="72" />
                <div class="flex flex-col gap-2">
                    <h2 class="text-xl font-semibold">Linked In</h2>
                    <p class="text-weak">Data Enrichment</p>
                </div>
            </div>
        </section>
    </div>
</template>

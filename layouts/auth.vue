<template>
    <main class="grid grid-cols-1 lg:grid-cols-2">
        <section class="relative -z-[2] min-h-screen overflow-hidden bg-slate-50 p-14 text-base-100">
            <img class="absolute -top-52 left-0 -z-[1] h-[50rem]" alt="" src="/bg/rectangle-35.svg" />

            <p class="mt-12 text-4xl font-bold">Close More Deals Seamlessly</p>
            <p class="mt-4 text-2xl">Streamline your sales process and get more revenue with our CRM lead management software</p>

            <div class="text-default absolute inset-x-0 bottom-32 px-[60px] py-5">
                <p class="text-xl">Developed based on challenges in many B2B businesses</p>
                <div class="gap- mt-6 flex flex-wrap justify-between gap-x-10 gap-y-4">
                    <NuxtImg src="/images/cohive-logo.png" alt="cohive logo" class="w-[140px] object-contain" />
                    <NuxtImg src="/images/match-logo.png" alt="match recruitment logo" class="w-[74px] object-contain" />
                    <NuxtImg src="/images/peakflo-logo.png" alt="peakflo logo" class="w-[102px] object-contain" />
                    <NuxtImg src="/images/nantiaja-logo.png" alt="nantiaja logo" class="w-[128px] object-contain" />
                    <NuxtImg src="/images/bukit-intan-logo.png" alt="bukit intan logo" class="w-[79px] object-contain" />
                    <NuxtImg src="/images/letterist-logo.png" alt="kota kota logo" class="w-[128px] object-contain" />
                    <NuxtImg src="/images/kota-kota-logo.png" alt="kota kota logo" class="w-[87px] object-contain" />
                    <NuxtImg src="/images/fazpass-logo.png" alt="fazpass logo" class="w-[119px] object-contain" />
                    <NuxtImg src="/images/ofon-logo.png" alt="ofon logo" class="w-[84px] object-contain" />
                </div>
            </div>
        </section>

        <slot />
    </main>
</template>

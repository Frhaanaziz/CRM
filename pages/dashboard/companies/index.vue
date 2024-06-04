<script setup lang="ts">
//     Be careful, if you want to call this route on SSR, you must send your browser cookies including your supabase token.
// const { data: { libraries }} = await useFetch('/api/libraries', {
//   headers: useRequestHeaders(['cookie'])
// })
// onMounted(() => {
//     console.log($auth.user)
// })
// const kinde = useKindeClient()
// console.log(kinde)
// const auth = useState('auth')
// console.log('auth', auth.value)
</script>



<template>
    <div class="px-4 sm:px-6 py-8">
        <h1 class="text-2xl font-semibold">
            B2B Company Database
        </h1>
        <pre class="text-2xl font-semibold">
            {{ $auth.user }}
        </pre>

        <div class="mt-10 grid grid-cols-3 gap-5">
            <div class="p-3 border border-default rounded-md">
                <p class="text-4xl text-brand font-semibold">60</p>
                <p>Companies</p>
            </div>
            <div class="p-3 border border-default rounded-md">
                <p class="text-4xl text-brand font-semibold">25</p>
                <p>Industries</p>
            </div>
            <div class="p-3 border border-default rounded-md">
                <p class="text-4xl text-brand font-semibold">30</p>
                <p>Locations</p>
            </div>
        </div>
    </div>

</template>
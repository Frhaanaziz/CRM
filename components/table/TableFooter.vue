<script setup lang="ts">
const props = defineProps<{
    pageTotal: number;
}>();
const { pageTotal } = toRefs(props);
const page = defineModel('page', { type: Number, required: true });
const pageCount = defineModel('pageCount', { type: Number, required: true });

const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
</script>

<template>
    <div class="mt-5 flex flex-wrap items-center justify-between">
        <div>
            <span class="text-sm leading-5">
                Showing
                <span class="font-medium">{{ pageFrom }}</span>
                to
                <span class="font-medium">{{ pageTo }}</span>
                of
                <span class="font-medium">{{ pageTotal }}</span>
                results
            </span>
        </div>

        <div class="hidden md:flex md:items-center md:gap-1.5">
            <span class="text-sm leading-5">Rows per page:</span>

            <USelect v-model.number="pageCount" :options="[3, 5, 10, 20, 30, 40]" class="me-2 w-20" size="xs" />
        </div>

        <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="pageTotal"
            :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: '!rounded-full min-w-[32px] justify-center',
                default: {
                    activeButton: {
                        variant: 'outline',
                    },
                },
            }"
        />
    </div>
</template>

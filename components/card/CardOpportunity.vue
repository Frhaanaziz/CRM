<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { Company, Lead, Opportunity, OpportunityStatus, User } from '~/types';

const props = defineProps<{
    opportunity: Opportunity & {
        status?: OpportunityStatus | null;
        user?: User | null;
        lead?: (Lead & { company?: Company | null }) | null;
    };
}>();
</script>

<template>
    <div class="space-y-2 border-l-4 border-l-brand p-4">
        <div class="flex items-center justify-between">
            <p class="truncate font-semibold text-brand">{{ props.opportunity.lead?.company?.name }}</p>
            <UButton variant="ghost" square color="black" icon="i-heroicons-ellipsis-vertical" disabled />
        </div>
        <div class="flex items-end justify-between">
            <div>
                <p class="font-semibold">
                    {{ props.opportunity.est_revenue ? formatToRupiah(props.opportunity.est_revenue) : '---' }}
                </p>
                <p class="text-weak">
                    {{ props.opportunity.confidence ? `${props.opportunity.confidence}%` : '---' }} on
                    {{
                        props.opportunity.act_close_date
                            ? useDateFormat(props.opportunity.act_close_date, 'DD/MM/YYYY').value.replace('"', '')
                            : '---'
                    }}
                </p>
            </div>
            <UBadge v-if="props.opportunity.status" size="sm" class="bg-[#007A4D] text-xs" :ui="{ rounded: 'rounded-full' }">
                {{ props.opportunity.status.name }}
            </UBadge>
        </div>
    </div>
</template>

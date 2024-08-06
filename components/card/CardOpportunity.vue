<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { Contact, Opportunity, OpportunityStatus } from '~/types';

defineProps<{
    opportunity: Opportunity & {
        status?: OpportunityStatus | null;
        contact?: Contact | null;
    };
}>();

const store = globalStore();
</script>

<template>
    <li class="border-l-4 border-l-brand p-2">
        <div class="flex items-center justify-between">
            <UBadge variant="subtle" size="xs" class="capitalize">
                {{ opportunity.status?.name || '---' }}
            </UBadge>
            <UButton variant="ghost" square color="black" icon="i-heroicons-ellipsis-vertical" disabled />
        </div>
        <p class="font-semibold text-slate-900">
            {{ opportunity.est_revenue ? formatToRupiah(opportunity.est_revenue) : '---' }}
        </p>
        <p class="text-sm text-slate-900">
            {{ opportunity.confidence ? `${opportunity.confidence}%` : '---' }} on
            {{
                opportunity.est_close_date
                    ? useDateFormat(opportunity.est_close_date, 'DD/MM/YYYY').value.replace('"', '')
                    : '---'
            }}
        </p>
        <div v-if="opportunity.contact" class="flex items-center justify-between py-1">
            <div class="text-slate-700">
                <p class="font-semibold">{{ getUserFullName(opportunity.contact) }}</p>
                <p v-if="opportunity.contact?.job_title" class="text-xs">{{ opportunity.contact.job_title }}</p>
            </div>
            <div class="flex gap-2">
                <UButton square icon="i-heroicons-envelope-solid" variant="ghost" color="black" disabled />

                <UButton
                    square
                    icon="i-heroicons-phone-solid"
                    variant="ghost"
                    color="black"
                    :disabled="!opportunity.contact?.mobile_phone"
                    @click="store.makeCall({ contact: opportunity.contact, opportunity_id: opportunity.id })"
                />
            </div>
        </div>
        <p v-if="opportunity.notes" class="pt-2 text-sm">{{ opportunity.notes }}</p>
    </li>
</template>

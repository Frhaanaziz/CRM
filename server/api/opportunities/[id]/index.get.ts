import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const [opportunityRes, tasksRes] = await Promise.all([
        supabase
            .from('Opportunities')
            .select(
                `
                *,
                status: Opportunity_Statuses(*),
                company: Companies(*),
                user: Users(*),
                close_reason: Close_Reasons(*),
                contact: Contacts(*),
                currency: Currencies(*),
                payment_plan: Payment_Plans(*)
                `
            )
            .eq('id', id)
            .single(),
        supabase
            .from('Tasks')
            .select(
                `
                id,
                date,
                description,
                is_completed,
                user: Users(*)
                `
            )
            .eq('opportunity_id', id)
            .order('created_at', { ascending: false }),
    ]);

    if (opportunityRes.error) {
        console.error('Error getting opportunity:', opportunityRes.error);
        throw createError({ status: 400, statusMessage: opportunityRes.error.message });
    }

    if (tasksRes.error) {
        console.error('Error getting tasks:', tasksRes.error);
        throw createError({ status: 400, statusMessage: tasksRes.error.message });
    }

    const { data: opportunityData } = opportunityRes;
    const { data: tasksData } = tasksRes;

    return { ...opportunityData, tasks: tasksData };
});

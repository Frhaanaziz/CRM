import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const { data, error } = await supabase
        .from('Leads')
        .select(
            `
            *,
            contact: Contacts(*),
            company: Companies(*),
            source: Sources(*),
            rating: Ratings(*),
            status: Lead_Statuses(*),
            user: Users(*),
            disqualify_reason: Disqualify_Reasons(*)
            `
        )
        .eq('id', id)
        .single();
    if (error) {
        console.error('Error getting lead:', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});

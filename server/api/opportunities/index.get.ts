import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase
        .from('Opportunities')
        .select(
            `
            *,
            company: Companies(id, name),
            contact: Contacts(id, first_name, last_name),
            rating: Ratings(name),
            status: Opportunity_Statuses(name)
            `
        )
        .order('created_at', { ascending: false });
    if (res.error) {
        console.error('Error fetching opportunities', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});
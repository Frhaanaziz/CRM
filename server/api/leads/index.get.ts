import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase
        .from('Leads')
        .select(
            `
            *,
            contact: Contacts(first_name, last_name),
            company: Companies(id, name),
            rating: Ratings(name),
            status: Lead_Statuses(name),
            disqualify_reason: Disqualify_Reasons(name),
            source: Sources(name),
            user: Users(first_name, last_name)
            `
        )
        .order('created_at', { ascending: false });
    if (res.error) {
        console.error('Error fetching leads', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

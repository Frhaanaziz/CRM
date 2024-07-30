import type { Database } from '~/types/supabase';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({
            status: 401,
            statusMessage: 'Unauthorized',
        });
    }

    const res = await supabase
        .from('Opportunities')
        .select(
            `
            *,
            company: Companies(*),
            contact: Contacts(*),
            rating: Ratings(*),
            status: Opportunity_Statuses(*)
            `
        )
        .eq('organization_id', user.user_metadata.organization_id);
    if (res.error) {
        console.error('Error fetching opportunities', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

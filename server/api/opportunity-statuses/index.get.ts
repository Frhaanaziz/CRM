import type { Database } from '~/types/supabase';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const { data, error } = await supabase
        .from('Opportunity_Statuses')
        .select()
        .eq('organization_id', user.user_metadata.organization_id)
        .order('index_number', { ascending: false });
    if (error) {
        console.error('Error fetching opportunity statuses (SERVER)', error);
        throw createError({
            status: 500,
            statusMessage: error.message,
        });
    }

    return data;
});

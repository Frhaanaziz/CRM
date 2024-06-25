import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const countRes = await supabase.from('Cities').select('*', { count: 'exact', head: true });
    if (countRes.error) {
        console.error('Failed to get Cities count', countRes.error);
        throw createError({
            status: 500,
            statusMessage: 'Failed to get Cities count',
        });
    }

    return countRes.count;
});

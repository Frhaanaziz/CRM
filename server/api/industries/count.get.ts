import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const countRes = await supabase.from('Industries').select('*', { count: 'exact', head: true });
    if (countRes.error) {
        console.error('Failed to get Industries count', countRes.error);
        throw createError({
            status: 500,
            statusMessage: 'Failed to get Industries count',
        });
    }

    return countRes.count;
});

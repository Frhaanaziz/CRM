import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const { data, error } = await supabase.from('Countries').select().order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching countries', error);
        throw createError({
            status: 500,
            statusMessage: error.message,
        });
    }

    return data;
});

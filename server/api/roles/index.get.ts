import type { H3Event } from 'h3';
import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const { data, error } = await supabase.from('Roles').select().order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching roles', error);
        throw createError({
            status: 500,
            statusMessage: error.message,
        });
    }

    return data;
});

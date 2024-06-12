import { H3Event } from 'h3';
import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase
        .from('Provinces')
        .select()
        .order('created_at', { ascending: false });
    if (res.error) {
        console.error('Error fetching provinces', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

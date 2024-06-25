import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase
        .from('Users')
        .select(
            `
            *,
            role: Roles(name)
            `
        )
        .order('created_at', { ascending: false });
    if (res.error) {
        console.error('Error fetching organization users', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

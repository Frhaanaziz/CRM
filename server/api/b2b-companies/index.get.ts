import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase
        .from('B2B_Companies')
        .select(
            `
            *,
            industry: Industries(*),
            size: Sizes(*),
            province: Provinces(*),
            city: Cities(*)
            `
        )
        .order('created_at', { ascending: false });
    if (res.error) {
        console.error('Error fetching B2B companies', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

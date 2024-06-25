import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const res = await supabase
        .from('Companies')
        .select(
            `
            *,
            industry: Industries(*),
            size: Sizes(*),
            country: Countries(*),
            province: Provinces(*),
            city: Cities(*)
            `
        )
        .eq('id', id)
        .single();
    if (res.error) {
        console.error('Error fetching company', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

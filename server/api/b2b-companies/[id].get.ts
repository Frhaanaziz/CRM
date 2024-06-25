import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const { data: company, error } = await supabase
        .from('B2B_Companies')
        .select(
            `
            *,
            industry: Industries(name),
            size: Sizes(size_range),
            province: Provinces(name),
            city: Cities(name)
            `
        )
        .eq('id', id)
        .single();
    if (error) throw createError({ status: 500, statusMessage: error.message });

    return company;
});

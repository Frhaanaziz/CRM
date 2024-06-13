import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    // get user id from params
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Company id is needed' });

    // get company details from supabase
    const { data: company, error } = await supabase
        .from('Companies')
        .select(
            `
      *,
      industry: Industries(name),
      size: Sizes(size_range),
      province: Provinces(name),
      city: Cities(name),
      photos: Photos(file)
    `,
        )
        .eq('id', id)
        .single();
    if (error) throw createError({ status: 500, statusMessage: error.message });

    return company;
});

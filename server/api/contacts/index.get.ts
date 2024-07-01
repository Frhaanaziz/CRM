import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase
        .from('Contacts')
        .select(
            `
            *,
            company: Companies!Contacts_company_id_fkey(*)
            `
        )
        .order('created_at', { ascending: false });
    if (res.error) {
        console.error('Error fetching contacts', res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

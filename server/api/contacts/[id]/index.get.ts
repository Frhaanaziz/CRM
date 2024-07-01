import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const res = await supabase
        .from('Contacts')
        .select(
            `
            *,
            company: Companies!Contacts_company_id_fkey(*),
            user: Users(*)
            `
        )
        .eq('id', id)
        .single();
    if (res.error) {
        console.error(`Error fetching contact with id: ${id}:`, res.error);
        throw createError({
            status: 500,
            statusMessage: res.error.message,
        });
    }

    return res.data;
});

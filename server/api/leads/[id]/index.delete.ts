import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const { error } = await supabase.from('Leads').delete().eq('id', id);
    if (error) {
        console.error(`Error deleteing lead with id: ${id}:`, error);
        throw createError({ status: 400, statusMessage: error.message });
    }
});
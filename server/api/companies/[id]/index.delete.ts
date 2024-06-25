import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const { error } = await supabase.from('Companies').delete().eq('id', id);
    if (error) {
        console.error(`Error deleteing company with id: ${id}:`, error.message);
        throw createError({ status: 400, statusMessage: error.message });
    }
});

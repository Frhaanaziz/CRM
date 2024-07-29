import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const { data, error } = await supabase
        .from('Invitations')
        .select('*, user: Users(*), organization: Organizations(*)')
        .eq('code', id)
        .single();

    if (error) {
        console.error('Error getting invitation:', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});

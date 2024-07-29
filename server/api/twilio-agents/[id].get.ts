import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const { data, error } = await supabase.from('Twilio_Agents').select('*').eq('id', id).single();
    if (error) {
        console.error('Error getting twilio agent (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});
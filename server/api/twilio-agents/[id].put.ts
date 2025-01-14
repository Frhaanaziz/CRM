import { serverSupabaseClient } from '#supabase/server';
import { updateTwilioAgentSchema } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Twilio agent id is needed' });

    const body = await readValidatedBody(event, updateTwilioAgentSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const { error } = await supabase.from('Twilio_Agents').update(body).eq('id', id);
    if (error) {
        if (error.code === '23505' && error.message.includes('twilio_number')) {
            throw createError({ status: 400, statusMessage: 'The Twilio number is already associated with another user.' });
        }
        console.error('Error updating twilio agent (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }
});

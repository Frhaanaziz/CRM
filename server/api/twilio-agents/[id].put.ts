import { serverSupabaseClient } from '#supabase/server';
import { updateTwilioAgentSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, updateTwilioAgentSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...restData } = zodResult.data;

    const { error } = await supabase.from('Twilio_Agents').update(restData).eq('id', id);
    if (error) {
        if (error.code === '23505' && error.message.includes('twilio_number')) {
            throw createError({ status: 400, statusMessage: 'The Twilio number is already associated with another user.' });
        }
        console.error('Error updating twilio agent (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }
});

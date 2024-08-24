import { serverSupabaseClient } from '#supabase/server';
import { updateTwilioSettingSchema } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Twilio setting id is needed' });

    const body = await readValidatedBody(event, updateTwilioSettingSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const { error } = await supabase.from('Twilio_Settings').update(body).eq('id', id);
    if (error) {
        console.error('Error updating twilio setting (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }
});

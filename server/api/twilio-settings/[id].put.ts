import { serverSupabaseClient } from '#supabase/server';
import { updateTwilioSettingSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, updateTwilioSettingSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...restData } = zodResult.data;

    const { error } = await supabase.from('Twilio_Settings').update(restData).eq('id', id);
    if (error) {
        console.error('Error updating twilio setting (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }
});

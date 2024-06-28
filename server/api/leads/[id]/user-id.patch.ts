import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateLeadUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const body = await readValidatedBody(event, updateLeadUserIdSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, user_id } = body.data;

    const { error } = await supabase.from('Leads').update({ user_id }).eq('id', id);
    if (error) {
        console.error('Error updating lead user_id', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

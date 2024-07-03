import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityTopicSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const body = await readValidatedBody(event, updateOpportunityTopicSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, topic } = body.data;

    const { error } = await supabase.from('Opportunities').update({ topic }).eq('id', id);
    if (error) {
        console.error('Error updating opportunity topic', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

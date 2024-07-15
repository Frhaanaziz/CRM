import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunitySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, updateOpportunitySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...restData } = zodResult.data;

    const { error } = await supabase
        .from('Opportunities')
        .update({
            ...restData,
            act_close_date: restData.act_close_date ? restData.act_close_date.toISOString() : null,
        })
        .eq('id', id);
    if (error) {
        console.error('Error updating opportunity', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

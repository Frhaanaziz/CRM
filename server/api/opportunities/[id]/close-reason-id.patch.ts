import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityCloseReasonIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResponse = await readValidatedBody(event, updateOpportunityCloseReasonIdSchema.safeParse);
    if (!zodResponse.success) {
        console.error('Error validating request body', zodResponse.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResponse) });
    }

    const { id, ...restData } = zodResponse.data;

    const { error } = await supabase.from('Opportunities').update(restData).eq('id', id);
    if (error) {
        console.error('Error updating opportunity close_reason_id', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityStatusId } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResponse = await readValidatedBody(event, updateOpportunityStatusId.safeParse);
    if (!zodResponse.success) {
        console.error('Error validating request body', zodResponse.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResponse) });
    }

    const { id, ...restData } = zodResponse.data;

    const { error } = await supabase.from('Opportunities').update(restData).eq('id', id);
    if (error) {
        console.error('Error updating opportunity oppotunity_status_id', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityActRevenue } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResponse = await readValidatedBody(event, updateOpportunityActRevenue.safeParse);
    if (!zodResponse.success) {
        console.error('Error validating request body', zodResponse.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResponse) });
    }

    const { id, ...restData } = zodResponse.data;

    const { error } = await supabase.from('Opportunities').update(restData).eq('id', id);
    if (error) {
        console.error('Error updating opportunity act_revenue', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityActCloseDate } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResponse = await readValidatedBody(event, updateOpportunityActCloseDate.safeParse);
    if (!zodResponse.success) {
        console.error('Error validating request body', zodResponse.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResponse) });
    }

    const { id, act_close_date } = zodResponse.data;

    const { error } = await supabase.from('Opportunities').update({ act_close_date: act_close_date?.toISOString() }).eq('id', id);
    if (error) {
        console.error('Error updating opportunity act_close_date', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

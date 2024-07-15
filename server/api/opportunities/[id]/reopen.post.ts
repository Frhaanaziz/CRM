import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityStatusId } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, updateOpportunityStatusId.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, opportunity_status_id } = zodResult.data;

    const res = await supabase
        .from('Opportunities')
        .update({
            opportunity_status_id,
            close_reason_id: null,
            act_revenue: null,
            act_close_date: null,
        })
        .eq('id', id);
    if (res.error) {
        console.error('Error reopen opportunity (SERVER)', res.error);
        throw createError({ status: 500, statusMessage: res.error.message });
    }
});

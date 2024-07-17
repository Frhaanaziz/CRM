import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, editOpportunityStatusSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, editOpportunityStatusSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...data } = zodResult.data;

    const { error } = await supabase.from('Opportunity_Statuses').update(data).eq('id', id);
    if (error) {
        console.error(`Error updating opportunity status with id: ${id}:`, error);
        throw createError({ status: 400, statusMessage: error.message });
    }
});

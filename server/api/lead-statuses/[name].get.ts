import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, leadStatusSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await getValidatedRouterParams(event, leadStatusSchema.pick({ name: true }).safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { data, error } = await supabase
        .from('Lead_Statuses')
        .select(
            `
            *
            `
        )
        .eq('name', zodResult.data.name)
        .single();
    if (error) {
        console.error('Error getting lead:', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});

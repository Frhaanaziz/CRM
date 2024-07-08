import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateB2BCompanySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, updateB2BCompanySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...restData } = zodResult.data;

    const { error } = await supabase.from('B2B_Companies').update(restData).eq('id', id);
    if (error) {
        console.error('Error updating organization', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

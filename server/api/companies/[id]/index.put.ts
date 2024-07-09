import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateCompanySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodRes = await readValidatedBody(event, updateCompanySchema.safeParse);
    if (!zodRes.success) {
        console.error('Error validating request body', zodRes.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodRes) });
    }

    const { id, ...rest } = zodRes.data;

    const res = await supabase.from('Companies').update(rest).eq('id', id);
    if (res.error) {
        console.error(`Error updating company with id: ${id}:`, res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }
});

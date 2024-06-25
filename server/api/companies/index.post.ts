import { serverSupabaseClient } from '#supabase/server';
import { addCompanySchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, addCompanySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { error: insertError } = await supabase.from('Companies').insert(zodResult.data);
    if (insertError) {
        console.error('Error inserting company:', insertError.message);
        throw createError({ status: 400, statusMessage: insertError.message });
    }
});

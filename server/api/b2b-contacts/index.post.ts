import { serverSupabaseClient } from '#supabase/server';
import { addB2BContactSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, addB2BContactSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const res = await supabase.from('B2B_Contacts').insert(zodResult.data);
    if (res.error) {
        console.error('Error inserting contact:', res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }
});

import { serverSupabaseClient } from '#supabase/server';
import { addContactSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, addContactSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { error: insertError } = await supabase.from('Contacts').insert(zodResult.data);
    if (insertError) {
        console.error('Error inserting contact:', insertError.message);
        throw createError({ status: 400, statusMessage: insertError.message });
    }
});

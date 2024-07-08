import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateContactSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodRes = await readValidatedBody(event, updateContactSchema.safeParse);
    if (!zodRes.success) {
        console.error('Error validating request body', zodRes.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodRes) });
    }

    const { id, ...rest } = zodRes.data;

    const res = await supabase.from('Contacts').update(rest).eq('id', id);
    if (res.error) {
        console.error(`Error updating contact with id: ${id}:`, res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }
});

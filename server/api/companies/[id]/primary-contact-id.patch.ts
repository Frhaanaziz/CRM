import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, addCompanyPrimaryContactSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const body = await readValidatedBody(event, addCompanyPrimaryContactSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, primary_contact_id } = body.data;

    const { error } = await supabase.from('Companies').update({ primary_contact_id }).eq('id', id);
    if (error) {
        console.error('Error updating company primary_contact_id', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});

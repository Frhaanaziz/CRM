import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';
import { contactSchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await getValidatedQuery(event, contactSchema.partial().safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const supabase = await serverSupabaseClient<Database>(event);

    const { data: contact, error: leadError } = await supabase
        .from('Contacts')
        .select(
            `
            *,
            company: Companies!Contacts_company_id_fkey(*)
            `
        )
        .match(zodResult.data);
    if (leadError) {
        if (leadError.code === 'PGRST116') {
            throw createError({ status: 404, statusMessage: 'Contact not found' });
        }
        console.error('Error fetching contacts:', leadError);
        throw createError({ status: 500, statusMessage: leadError.message });
    }
    if (!contact.length) {
        throw createError({ status: 404, statusMessage: 'Contact not found' });
    }

    return contact;
});

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

    // eslint-disable-next-line prefer-const
    let { data: contactStatus, error: contactStatusError } = await supabase
        .from('Contact_Statuses')
        .select('id')
        .eq('name', 'new')
        .single();
    if (contactStatusError) {
        console.error('Error fetching contact status:', contactStatusError);
        throw createError({ status: 500, statusMessage: contactStatusError.message });
    }

    if (!contactStatus) {
        const { data: newStatus, error } = await supabase.from('Contact_Statuses').insert({ name: 'new' }).select('id').single();
        if (error) {
            console.error('Error inserting new contact status:', error);
            throw createError({ status: 500, statusMessage: error.message });
        }

        contactStatus = newStatus;
    }

    const { data: contact, error: insertError } = await supabase
        .from('Contacts')
        .insert({
            ...zodResult.data,
            contact_status_id: contactStatus.id,
        })
        .select('*')
        .single();
    if (insertError) {
        console.error('Error inserting contact:', insertError);
        throw createError({ status: 400, statusMessage: insertError.message });
    }

    return contact;
});

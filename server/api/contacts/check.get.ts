import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { contactSchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, contactSchema.omit({ organization_id: true }).partial().safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const supabase = await serverSupabaseClient<Database>(event);

    const { data, error } = await supabase
        .from('Contacts')
        .select('*')
        // need user_id?
        .match({ ...zodResult.data, organization_id: user.user_metadata.organization_id });
    if (error) {
        console.error('Error check contacts (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});

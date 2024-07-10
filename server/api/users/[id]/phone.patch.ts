import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateUserPhoneSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const body = await readValidatedBody(event, updateUserPhoneSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, phone } = body.data;

    const { error: errorPublicUser } = await supabase.from('Users').update({ phone }).eq('id', id);
    if (errorPublicUser) {
        console.error('Error updating user phone in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user phone' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { phone } });
    if (errorAuthUser) {
        console.error('Error updating user phone in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user phone in auth' });
    }

    await supabase.auth.refreshSession();
});

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateUserStatusSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const body = await readValidatedBody(event, updateUserStatusSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, status } = body.data;

    const { error: errorPublicUser } = await supabase.from('Users').update({ status }).eq('id', id);
    if (errorPublicUser) {
        console.error('Error updating user status in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user status' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { status } });
    if (errorAuthUser) {
        console.error('Error updating user status in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user status in auth' });
    }
});

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateUserRoleSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const body = await readValidatedBody(event, updateUserRoleSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, role_id } = body.data;

    const { error: errorPublicUser } = await supabase.from('Users').update({ role_id }).eq('id', id);
    if (errorPublicUser) {
        console.error('Error updating user role in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user role' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { role_id } });
    if (errorAuthUser) {
        console.error('Error updating user role in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user role in auth' });
    }

    await supabase.auth.refreshSession();
});

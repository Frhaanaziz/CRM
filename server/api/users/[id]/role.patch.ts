import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { updateUserRoleSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, updateUserRoleSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const { error: errorPublicUser } = await supabase.from('Users').update(body).eq('id', id);
    if (errorPublicUser) {
        console.error('Error updating user role in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user role' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: body });
    if (errorAuthUser) {
        console.error('Error updating user role in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user role in auth' });
    }

    await supabase.auth.refreshSession();
});

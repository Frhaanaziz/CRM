import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { updateUserStatusSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const { id, status } = await readValidatedBody(event, updateUserStatusSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

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

    await supabase.auth.refreshSession();
});

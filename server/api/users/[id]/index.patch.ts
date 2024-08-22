import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { userSchema } from '~/utils/validators/user';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, userSchema.omit({ created_at: true, updated_at: true }).partial().parse);

    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const { error: authUserError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: body,
    });
    if (authUserError) {
        console.error('Error updating user in auth (SERVER)', authUserError);
        throw createError({ status: 500, statusMessage: authUserError.message });
    }

    const { error: publicUserError } = await supabase.from('Users').update(body).eq('id', id);
    if (publicUserError) {
        console.error('Error updating user in Users table (SERVER)', publicUserError);
        throw createError({ status: 500, statusMessage: publicUserError.message });
    }
});

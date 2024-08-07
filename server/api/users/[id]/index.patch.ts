import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { userSchema } from '~/utils/validators/user';
import { getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, userSchema.omit({ created_at: true, updated_at: true }).partial().safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { error: authUserError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: body.data,
    });
    if (authUserError) {
        console.error('Error updating user in auth', authUserError);
        throw createError({ status: 500, statusMessage: authUserError.message });
    }

    const { error: publicUserError } = await supabase.from('Users').update(body.data).eq('id', id);
    if (publicUserError) {
        console.error('Error updating user in Users table', publicUserError);
        throw createError({ status: 500, statusMessage: publicUserError.message });
    }
});

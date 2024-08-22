import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { updateUserSchema } from '~/utils/validators/user';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, updateUserSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const { data: session, error: authUserError } = await supabase.auth.updateUser({
        data: body,
    });
    if (authUserError) {
        console.error('Error updating user in auth', authUserError);
        throw createError({ status: 500, statusMessage: authUserError.message });
    }

    const { error: publicUserError } = await supabase.from('Users').update(body).eq('id', id);
    if (publicUserError) {
        console.error('Error updating user in Users table', publicUserError);
        throw createError({ status: 500, statusMessage: publicUserError.message });
    }

    await supabase.auth.refreshSession();

    return { session };
});

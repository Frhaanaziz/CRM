import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { updateUserSchema } from '~/utils/validators/user';
import { getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, updateUserSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { first_name, last_name, phone, linkedin } = body.data;

    const { error: authUserError } = await supabase.auth.updateUser({
        data: {
            first_name,
            last_name,
            phone,
            linkedin,
        },
    });
    if (authUserError) {
        console.error('Error updating user in auth', authUserError);
        throw createError({ status: 500, statusMessage: authUserError.message });
    }

    const { error: publicUserError } = await supabase
        .from('Users')
        .update({
            first_name,
            last_name,
            phone,
            linkedin,
        })
        .eq('id', id);
    if (publicUserError) {
        console.error('Error updating user in Users table', publicUserError);
        throw createError({ status: 500, statusMessage: publicUserError.message });
    }
    await supabase.auth.refreshSession();
});

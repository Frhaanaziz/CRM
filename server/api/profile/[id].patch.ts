import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { updateProfileSchema } from '~/utils/validators/profile';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    // get user id from params
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    // validate the request body
    const body = await readValidatedBody(event, updateProfileSchema.safeParse);
    if (!body.success) {
        let errors = '';
        for (const issue in body.error.issues) {
            if (Number(issue) === body.error.issues.length - 1) {
                errors += `${body.error.issues[issue].path} - ${body.error.issues[issue].message}`;
            } else {
                errors += `${body.error.issues[issue].path} - ${body.error.issues[issue].message}, `;
            }
        }
        throw createError({ status: 400, statusMessage: errors });
    }

    // destruct the request body
    const { first_name, last_name, phone, linkedin } = body.data;

    // prepare update user data for kinde
    const inputBody = {
        given_name: first_name,
        family_name: last_name,
    };

    // get access token from kinde
    const token = await getAccessToken();

    // update user in kinde
    const response = await $fetch(`${process.env.KINDE_API_URL}/api/v1/user?id=${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(inputBody),
    });
    if (!response) throw createError({ status: 500, statusMessage: 'Failed to update user' });

    // update user in supabase
    const { data: user, error: updateError } = await supabase
        .from('Users')
        .update({
            first_name,
            last_name,
            phone,
            linkedin,
        })
        .eq('id', id)
        .select()
        .single();
    if (updateError) throw createError({ status: 500, statusMessage: updateError.message });

    return user;
});

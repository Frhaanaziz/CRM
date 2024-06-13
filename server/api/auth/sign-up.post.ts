import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import { signUpSchema } from '~/utils/validators/auth';
import type { CreateUserResponse } from '~/types/kinde';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    // validate the request body
    const body = await readValidatedBody(event, signUpSchema.safeParse);
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
    const { email, first_name, last_name, phone } = body.data;

    // prepare user data for kinde
    const inputBody = {
        profile: {
            given_name: first_name,
            family_name: last_name,
        },
        organization_code: 'Default Organization',
        identities: [
            {
                type: 'email',
                details: {
                    email,
                    phone,
                },
            },
        ],
    };

    // get access token from kinde
    const token = await getAccessToken();

    // create user in kinde
    const response = await $fetch<CreateUserResponse>(`${process.env.KINDE_API_URL}/api/v1/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(inputBody),
    });
    if (!response) throw createError({ status: 500, statusMessage: 'Failed to create user' });

    // create user in supabase
    const { error } = await supabase.from('Users').insert({
        id: response.id,
        email,
        first_name,
        last_name,
        phone,
        linkedin: '',
        photo: '',
    });
    if (error) throw createError({ status: 500, statusMessage: error.message });

    return { data: 'OK' };
});

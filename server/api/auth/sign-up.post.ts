import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import { signUpSchema } from '~/utils/validators/auth';
import { getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const runtimeConfig = useRuntimeConfig();

    const body = await readValidatedBody(event, signUpSchema.safeParse);
    if (!body.success) {
        console.error('Error validating body:', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { email, first_name, last_name, phone, password } = body.data;

    // const { data: initialUser } = await supabase.from('Users').select().eq('email', email).single();
    // if (initialUser) {
    //     console.log('Resending signup email to:', initialUser.email);
    //     const { error } = await supabase.auth.resend({
    //         type: 'signup',
    //         email: initialUser.email,
    //         options: {
    //             emailRedirectTo: runtimeConfig.public.BASE_URL + '/dashboard',
    //         },
    //     });
    //     if (error) {
    //         console.error('Error resending signup:', error.message);
    //         throw createError({ status: error.status ?? 400, statusMessage: error.message });
    //     }
    //     return;
    // }

    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: runtimeConfig.public.BASE_URL + '/dashboard',
            data: {
                first_name,
                last_name,
                phone,
            },
        },
    });
    if (signUpError) {
        console.error('Error signing up:', signUpError.message);
        throw createError({ status: signUpError.status ?? 400, statusMessage: signUpError.message });
    }

    const user = data.user;
    if (!user) {
        console.error('Error signing up: no user returned');
        throw createError({ status: 400, statusMessage: 'Error signing up: no user returned' });
    }

    const { error: insertError } = await supabase.from('Users').insert({
        id: user.id,
        email,
        first_name,
        last_name,
        phone,
        role_id: 1,
        organization_id: 2,
    });
    if (insertError) {
        console.error('Error inserting user:', insertError.message);
        throw createError({ status: 400, statusMessage: insertError.message });
    }
});

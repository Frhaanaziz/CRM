import { serverSupabaseClient } from '#supabase/server';
import { signUpSchema } from '~/utils/validators/auth';
import { getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const runtimeConfig = useRuntimeConfig();

    const body = await readValidatedBody(event, signUpSchema.safeParse);
    if (!body.success) {
        console.error('Error validating body:', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { email, first_name, last_name, password } = body.data;

    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: runtimeConfig.public.BASE_URL + '/auth/signin',
            data: {
                email,
                first_name,
                last_name,
            },
        },
    });
    if (signUpError) {
        console.error('Error signing up:', signUpError);
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
    });
    if (insertError) {
        console.error('Error inserting user:', insertError);
        throw createError({ status: 400, statusMessage: insertError.message });
    }
});

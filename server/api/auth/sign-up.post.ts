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

    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: runtimeConfig.public.BASE_URL + '/auth/confirm',
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
});

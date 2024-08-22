import { serverSupabaseClient } from '#supabase/server';
import { signUpSchema } from '~/utils/validators/auth';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, signUpSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const { email, first_name, last_name, password } = body;

    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: useRuntimeConfig().public.BASE_URL + '/auth/confirm',
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

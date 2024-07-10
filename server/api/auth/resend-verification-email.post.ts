import { serverSupabaseClient } from '#supabase/server';
import { getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const runtimeConfig = useRuntimeConfig();

    const body = await readValidatedBody(event, z.object({ email: z.string().email() }).safeParse);
    if (!body.success) {
        console.error('Error validating body:', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { email } = body.data;

    const res = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: `${runtimeConfig.public.BASE_URL}/auth/onboarding`,
        },
    });
    if (res.error) {
        console.error('Error resending signup:', res.error.message);
        throw createError({ status: res.error.status ?? 400, statusMessage: res.error.message });
    }
});

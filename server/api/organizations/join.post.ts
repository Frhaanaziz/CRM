import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';
import { joinOrganizationSchema, getZodErrorMessage } from '~/utils';
import type { User } from '~/types';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, joinOrganizationSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const supabase = await serverSupabaseClient<Database>(event);

    const fetchApi = await backendApi(event);
    const { data: user } = await fetchApi<{ data: User }>('/organizations/join', {
        method: 'POST',
        body: JSON.stringify(zodResult.data),
    });

    await supabase.auth.updateUser({
        data: user,
    });
});

import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';
import { joinOrganizationSchema, getNestErrorMessage, getErrorCode } from '~/utils';
import type { User } from '~/types';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, joinOrganizationSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    try {
        const fetchApi = await backendApi(event);
        const { data: user } = await fetchApi<{ data: User }>('/organizations/join', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        await supabase.auth.updateUser({ data: user });
    } catch (error) {
        console.error('Error joining organization (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

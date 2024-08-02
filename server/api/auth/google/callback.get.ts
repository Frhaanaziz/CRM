import { serverSupabaseClient } from '#supabase/server';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{
            data: {
                refresh_token: string;
            };
        }>('/auth/google/connect/callback', {
            query: getQuery(event),
        });

        await supabase.auth.updateUser({ data: { google_refresh_token: data.refresh_token } });

        await supabase.auth.refreshSession();

        return data;
    } catch (error) {
        console.error('Error getting access_token and refresh_token (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

import { serverSupabaseUser } from '#supabase/server';
import { getNestErrorMessage, getErrorCode } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const runtimeConfig = useRuntimeConfig();
    try {
        const { data } = await $fetch<{ data: { token: string } }>('/twilio/generate-access-token', {
            method: 'POST',
            body: JSON.stringify({ user_id: user.id }),
            baseURL: runtimeConfig.TWILIO_BACKEND_URL,
        });

        return data;
    } catch (error) {
        console.error('Error generating Twilio access token (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

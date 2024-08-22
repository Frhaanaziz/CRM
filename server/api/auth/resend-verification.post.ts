import { getErrorCode, getNestErrorMessage } from '~/utils';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, z.object({ email: z.string().trim().email() }).parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error resending signup:', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
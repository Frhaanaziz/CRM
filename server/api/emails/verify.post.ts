import { z } from 'zod';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, z.object({ email: z.string().trim().email() }).parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi('/emails/verify', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error verifying email (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

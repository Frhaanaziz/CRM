import { z } from 'zod';
import { getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, z.object({ email: z.string().email() }).safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const fetchApi = await backendApi(event);
    await fetchApi('/emails/verify', {
        method: 'POST',
        body: JSON.stringify(zodResult.data),
    });
});

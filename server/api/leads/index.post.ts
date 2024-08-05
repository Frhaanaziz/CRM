import { addLeadSchema, getErrorCode, getNestErrorMessage, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, addLeadSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads`, {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });
    } catch (error) {
        console.error('Error creating lead (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

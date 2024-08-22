import { addLeadSchema, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, addLeadSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error creating lead (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

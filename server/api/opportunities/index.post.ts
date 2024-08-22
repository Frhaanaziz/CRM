import { addOpportunitySchema, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, addOpportunitySchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi('/opportunities', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error creating opportunity (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

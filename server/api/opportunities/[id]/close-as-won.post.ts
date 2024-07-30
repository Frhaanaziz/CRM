import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateOpportunityAsWonSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, updateOpportunityAsWonSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...rest } = zodResult.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}/close-as-won`, {
            method: 'PATCH',
            body: JSON.stringify(rest),
        });
    } catch (error) {
        console.error('Error close opportunity as won (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

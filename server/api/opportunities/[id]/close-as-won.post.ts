import { getErrorCode, getNestErrorMessage, updateOpportunityAsWonSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, updateOpportunityAsWonSchema.parse);

    const { id, ...rest } = body;

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

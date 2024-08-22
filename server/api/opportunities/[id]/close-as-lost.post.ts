import { getErrorCode, getNestErrorMessage, updateOpportunityAsLostSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, updateOpportunityAsLostSchema.parse);

    const { id, ...rest } = body;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}/close-as-lost`, {
            method: 'PATCH',
            body: JSON.stringify(rest),
        });
    } catch (error) {
        console.error('Error close opportunity as lost (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

import { getErrorCode, getNestErrorMessage, updateOpportunityAsLostSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    const body = await readValidatedBody(event, updateOpportunityAsLostSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}/close-as-lost`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error close opportunity as lost (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

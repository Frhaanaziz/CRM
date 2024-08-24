import { getErrorCode, getNestErrorMessage, updateOpportunityAsWonSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    const body = await readValidatedBody(event, updateOpportunityAsWonSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}/close-as-won`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error close opportunity as won (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

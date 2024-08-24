import { addLeadOpportunitySchema, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Invalid id' });

    const body = await readValidatedBody(event, addLeadOpportunitySchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}/opportunity`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error creating lead opportunity (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

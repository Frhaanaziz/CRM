import { getErrorCode, getNestErrorMessage, updateOpportunitySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    const body = await readValidatedBody(event, updateOpportunitySchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating opportunity with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

import { getErrorCode, getNestErrorMessage, updateOpportunityUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    const body = await readValidatedBody(event, updateOpportunityUserIdSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}/user`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating opportunity user_id with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

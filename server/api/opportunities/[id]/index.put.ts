import { getErrorCode, getNestErrorMessage, updateOpportunitySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, updateOpportunitySchema.parse);

    const { id, ...restData } = body;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(restData),
        });
    } catch (error) {
        console.error(`Error updating opportunity with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

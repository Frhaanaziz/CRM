import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateOpportunityUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, updateOpportunityUserIdSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, user_id } = body.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}/user`, {
            method: 'PATCH',
            body: JSON.stringify({ user_id }),
        });
    } catch (error) {
        console.error(`Error updating opportunity user_id with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

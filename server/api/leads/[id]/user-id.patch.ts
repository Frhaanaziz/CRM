import { getErrorCode, getNestErrorMessage, updateLeadUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Lead id is needed' });

    const body = await readValidatedBody(event, updateLeadUserIdSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}/user`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating lead user_id with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

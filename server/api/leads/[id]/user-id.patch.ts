import { getErrorCode, getNestErrorMessage, updateLeadUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, updateLeadUserIdSchema.parse);

    const { id, user_id } = body;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}/user`, {
            method: 'PATCH',
            body: JSON.stringify({ user_id }),
        });
    } catch (error) {
        console.error(`Error updating lead user_id with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateLeadUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, updateLeadUserIdSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, user_id } = body.data;

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

import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateCompanyUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodRes = await readValidatedBody(event, updateCompanyUserIdSchema.safeParse);
    if (!zodRes.success) {
        console.error('Error validating request body', zodRes.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodRes) });
    }

    const { id, user_id } = zodRes.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/companies/${id}/user`, {
            method: 'PATCH',
            body: JSON.stringify({ user_id }),
        });
    } catch (error) {
        console.error(`Error updating company user_id with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

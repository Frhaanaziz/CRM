import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateB2BCompanySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, updateB2BCompanySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...restData } = zodResult.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/b2b-companies/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(restData),
        });
    } catch (error) {
        console.error(`Error updating b2b company with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

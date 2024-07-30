import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateCompanySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodRes = await readValidatedBody(event, updateCompanySchema.partial().safeParse);
    if (!zodRes.success) {
        console.error('Error validating request body', zodRes.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodRes) });
    }

    const { id, ...restData } = zodRes.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/companies/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(restData),
        });
    } catch (error) {
        console.error(`Error updating company with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

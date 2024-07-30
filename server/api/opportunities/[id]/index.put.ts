import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateOpportunitySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, updateOpportunitySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, ...restData } = zodResult.data;

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

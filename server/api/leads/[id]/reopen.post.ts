import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateLeadStatus } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = updateLeadStatus.safeParse(JSON.parse(await readBody(event)));
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, status } = zodResult.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}/reopen`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    } catch (error) {
        console.error(`Error reopen lead with id ${id} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

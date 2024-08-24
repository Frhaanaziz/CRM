import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'No opportunity status ID provided.' });

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunity-statuses/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleteing opportunity status with id: ${id}:`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

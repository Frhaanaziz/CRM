import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunities/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting opportunity with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

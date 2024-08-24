import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Contact id is needed' });

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/contacts/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting contact with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

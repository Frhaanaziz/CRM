import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting lead with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

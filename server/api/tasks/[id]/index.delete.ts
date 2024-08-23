import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Lead id is needed' });

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/tasks/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting task with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

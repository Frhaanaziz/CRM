import { getErrorCode, getNestErrorMessage, updateTaskSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const { id, ...restData } = await readValidatedBody(event, updateTaskSchema.partial().parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(restData),
        });
    } catch (error) {
        console.error(`Error updating task with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

import { getErrorCode, getNestErrorMessage, updateTaskSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Task id is needed' });

    const body = await readValidatedBody(event, updateTaskSchema.partial().parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating task with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

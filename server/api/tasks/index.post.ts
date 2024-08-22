import { addTaskSchema, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, addTaskSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/tasks`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error creating task (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

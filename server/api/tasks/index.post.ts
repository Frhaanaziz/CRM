import { addTaskSchema, getErrorCode, getNestErrorMessage, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, addTaskSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/tasks`, {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });
    } catch (error) {
        console.error('Error creating task (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

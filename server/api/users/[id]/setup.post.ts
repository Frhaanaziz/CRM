import { setupUserSchema, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, setupUserSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/users/${id}/setup`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error setup user with id ${id} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

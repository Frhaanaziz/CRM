import { getErrorCode, getNestErrorMessage, updateContactSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Missing id' });

    const body = await readValidatedBody(event, updateContactSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/contacts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error update contacts with id ${id} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

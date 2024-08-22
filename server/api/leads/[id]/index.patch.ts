import { getErrorCode, getNestErrorMessage, leadSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Lead id is needed' });

    const body = await readValidatedBody(event, leadSchema.partial().parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating lead with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

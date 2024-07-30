import { getErrorCode, getNestErrorMessage, getZodErrorMessage, leadSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Lead id is needed' });

    const zodRes = await readValidatedBody(event, leadSchema.partial().safeParse);
    if (!zodRes.success) {
        console.error('Error validating request body', zodRes.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodRes) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(zodRes.data),
        });
    } catch (error) {
        console.error(`Error updating lead with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

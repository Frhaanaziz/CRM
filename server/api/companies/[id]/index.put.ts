import { getErrorCode, getNestErrorMessage, updateCompanySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Company id is needed' });

    const body = await readValidatedBody(event, updateCompanySchema.partial().parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/companies/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating company with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const company_id = event.context.params?.id;
    if (!company_id) throw createError({ status: 400, statusMessage: 'company_id is required' });

    const overview_id = event.context.params?.overview_id;
    if (!overview_id) throw createError({ status: 400, statusMessage: 'overview_id is required' });

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/companies/${company_id}/overview/${overview_id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting company overview with id (${overview_id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

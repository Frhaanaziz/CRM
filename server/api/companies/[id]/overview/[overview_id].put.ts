import { getErrorCode, getNestErrorMessage, updateCompanyOverviewSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const company_id = getRouterParam(event, 'id');
    if (!company_id) throw createError({ status: 400, statusMessage: 'company_id is required' });

    const overview_id = getRouterParam(event, 'overview_id');
    if (!overview_id) throw createError({ status: 400, statusMessage: 'overview_id is required' });

    const body = await readValidatedBody(event, updateCompanyOverviewSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/companies/${company_id}/overview/${overview_id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating company overview with id (${overview_id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

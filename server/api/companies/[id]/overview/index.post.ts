import { addCompanyOverviewSchema, getNestErrorMessage, getErrorCode } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Company id is needed' });

    const body = await readValidatedBody(event, addCompanyOverviewSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/companies/${id}/overview`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error creating company overview (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

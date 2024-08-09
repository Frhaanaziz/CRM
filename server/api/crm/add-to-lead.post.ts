import { getErrorCode, getNestErrorMessage, addB2BCompanyToLeadSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, addB2BCompanyToLeadSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi('/crm/add-to-lead', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error add to lead (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

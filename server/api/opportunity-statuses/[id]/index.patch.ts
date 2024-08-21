import { editOpportunityStatusSchema, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'No opportunity status ID provided.' });

    const body = await readValidatedBody(event, editOpportunityStatusSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/opportunity-statuses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error updating opportunity status with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

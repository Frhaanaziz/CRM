import { addLeadOpportunitySchema, getErrorCode, getNestErrorMessage, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Invalid id' });

    const zodResult = await readValidatedBody(event, addLeadOpportunitySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}/opportunity`, {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });
    } catch (error) {
        console.error('Error creating lead opportunity (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

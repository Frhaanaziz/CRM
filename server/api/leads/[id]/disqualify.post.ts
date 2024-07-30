import { getErrorCode, getNestErrorMessage, getZodErrorMessage, leadSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = leadSchema.pick({ id: true, disqualify_reason_id: true }).safeParse(JSON.parse(await readBody(event)));
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, disqualify_reason_id } = zodResult.data;

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/leads/${id}/disqualify`, {
            method: 'PATCH',
            body: JSON.stringify({ disqualify_reason_id }),
        });
    } catch (error) {
        console.error(`Error reopen lead with id ${id} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

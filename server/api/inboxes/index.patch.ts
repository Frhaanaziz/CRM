import { getErrorCode, getNestErrorMessage, readInboxSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, readInboxSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi('/inboxes', {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`Error update inboxes read status (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

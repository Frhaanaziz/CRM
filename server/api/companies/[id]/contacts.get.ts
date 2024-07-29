import type { Contact } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Contact[] }>(`/companies/${id}/contacts`);

        return data;
    } catch (error) {
        console.error(`Error getting contacts for company with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

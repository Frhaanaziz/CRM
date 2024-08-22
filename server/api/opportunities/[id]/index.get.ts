import type { Company, Contact, Currency, Lead, Opportunity, OpportunityStatus, Task, User } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity ID is required.' });

    interface IOpportunity extends Opportunity {
        status?: OpportunityStatus | null;
        user?: User | null;
        contact?: Contact | null;
        currency?: Currency | null;
        lead?: (Lead & { company?: Company | null }) | null;
        tasks?: (Pick<Task, 'id' | 'date' | 'description' | 'is_completed'> & { user?: User | null })[] | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: IOpportunity }>(`/opportunities/${id}`);

        return data;
    } catch (error) {
        console.error(`Error getting opportunity with id ${id} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

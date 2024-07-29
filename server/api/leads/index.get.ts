import type { Company, Contact, DisqualifyReason, Lead, User, Source, Rating, PaginationUtils } from '~/types';
import { serverSupabaseUser } from '#supabase/server';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    interface ILead extends Lead {
        contact: Pick<Contact, 'first_name' | 'last_name'> | null;
        company: Pick<Company, 'name'> | null;
        rating: Pick<Rating, 'name'> | null;
        disqualify_reason: Pick<DisqualifyReason, 'name'> | null;
        source: Pick<Source, 'name'> | null;
        user: Pick<User, 'first_name' | 'last_name'> | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: PaginationUtils & { result: ILead[] } }>('/leads', {
            query: getQuery(event),
        });

        return data;
    } catch (error) {
        console.error('Error getting leads (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});

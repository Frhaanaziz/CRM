import type { Company, Lead, User, Rating, PaginationUtils, Contact } from '~/types';
import { serverSupabaseUser } from '#supabase/server';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    interface ILead extends Lead {
        company: (Pick<Company, 'id' | 'name'> & { contacts?: Contact[] | null }) | null;
        rating: Pick<Rating, 'name'> | null;
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

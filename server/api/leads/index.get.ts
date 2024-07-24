import type { Company, Contact, DisqualifyReason, Lead, User, Source, Rating, PaginationUtils } from '~/types';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const queryParam = getQuery(event);
    interface ILead extends Lead {
        contact: Pick<Contact, 'first_name' | 'last_name'> | null;
        company: Pick<Company, 'name'> | null;
        rating: Pick<Rating, 'name'> | null;
        disqualify_reason: Pick<DisqualifyReason, 'name'> | null;
        source: Pick<Source, 'name'> | null;
        user: Pick<User, 'first_name' | 'last_name'> | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: PaginationUtils & { result: ILead[] } }>('/leads', {
        query: getQuery(event),
    });

    return data;

    // const query = queryParam.query;
    // const page = parseInt(queryParam.page as string) || 1;
    // const limit = parseInt(queryParam.pageCount as string) || (10 as number);
    // const sort = queryParam.sort || ('created_at' as any);
    // const order = queryParam.order || ('desc' as string);
    // const offset = (page - 1) * limit;

    // const { data, error } = await supabase
    //     .from('Leads')
    //     .select(
    //         `
    //         *,
    //         contact: Contacts!inner(*),
    //         company: Companies(*),
    //         rating: Ratings(*),
    //         disqualify_reason: Disqualify_Reasons(*),
    //         source: Sources(*),
    //         user: Users(*)
    //         `
    //     )
    //     .match({ user_id: user.id, organization_id: user.user_metadata.organization_id })
    //     .ilike('contact.first_name', `%${query}%`)
    //     .order(sort, { ascending: order === 'asc' })
    //     .range(offset, offset + limit - 1);
    // if (error) {
    //     console.error('Error fetching leads:', error);
    //     throw createError({ status: 500, statusMessage: error.message });
    // }

    // const { count, error: countError } = await supabase
    //     .from('Leads')
    //     .select(
    //         `
    //         *,
    //         contact: Contacts!inner(*),
    //         company: Companies(*),
    //         rating: Ratings(*),
    //         disqualify_reason: Disqualify_Reasons(*),
    //         source: Sources(*),
    //         user: Users(*)
    //         `,
    //         { count: 'exact', head: true }
    //     )
    //     .match({ user_id: user.id, organization_id: user.user_metadata.organization_id })
    //     .ilike('contact.first_name', `%${query}%`);
    // if (countError) {
    //     console.error('Error counting leads:', countError);
    //     throw createError({ status: 500, statusMessage: countError.message });
    // }

    // return {
    //     current_page: page,
    //     row_per_page: limit,
    //     is_first_page: page === 1,
    //     is_last_page: page === Math.ceil(count ?? 0 / limit),
    //     prev_page: page > 1 ? page - 1 : page,
    //     next_page: page < Math.ceil(count ?? 0 / limit) ? page + 1 : page,
    //     total_row: count ?? 0,
    //     total_page: Math.ceil(count ?? 0 / limit),
    //     result: data,
    // };
});

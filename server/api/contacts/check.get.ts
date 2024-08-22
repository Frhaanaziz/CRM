import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { contactSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const query = await getValidatedQuery(event, contactSchema.omit({ organization_id: true }).partial().parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const { data, error } = await supabase
        .from('Contacts')
        .select('*, company: Companies(*)')
        // need user_id?
        .match({ ...query, organization_id: user.user_metadata.organization_id });
    if (error) {
        console.error('Error check contacts (SERVER):', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});
// import { serverSupabaseUser } from '#supabase/server';
// import type { Company, Contact } from '~/types';
// import { contactSchema, getErrorCode, getNestErrorMessage } from '~/utils';

// export default defineEventHandler(async (event) => {
//     const body = await getValidatedQuery(event, contactSchema.omit({ organization_id: true }).partial().parse);

//     interface IContact extends Contact {
//         company?: Company | null;
//     }

//     try {
//         const fetchApi = await backendApi(event);
//         const { data } = await fetchApi<{ data: IContact[] }>('/contacts/check', {
//             body: JSON.stringify(body),
//         });

//         return data;
//     } catch (error) {
//         console.error('Error check contacts (SERVER):', error);
//         throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
//     }
// });

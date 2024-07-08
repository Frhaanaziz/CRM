import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const [companyRes, contactsRes] = await Promise.all([
        supabase
            .from('B2B_Companies')
            .select(
                `
            *,
            industry: Industries(id, name),
            size: Sizes(id, size_range),
            province: Provinces(id, name),
            city: Cities(id, name)
            `
            )
            .eq('id', id)
            .single(),
        supabase.from('B2B_Contacts').select('*').eq('company_id', id).order('created_at', { ascending: false }),
    ]);

    if (companyRes.error) {
        console.error('Error getting lead:', companyRes.error);
        throw createError({ status: 400, statusMessage: companyRes.error.message });
    }

    if (contactsRes.error) {
        console.error('Error getting tasks:', contactsRes.error);
        throw createError({ status: 400, statusMessage: contactsRes.error.message });
    }

    const { data: companyData } = companyRes;
    const { data: contactsData } = contactsRes;

    return { ...companyData, b2b_contacts: contactsData };
});

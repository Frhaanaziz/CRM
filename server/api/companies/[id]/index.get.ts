import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const [companyRes, opportunitiesRes] = await Promise.all([
        supabase
            .from('Companies')
            .select(
                `
            *,
            industry: Industries(*),
            size: Sizes(*),
            country: Countries(*),
            province: Provinces(*),
            city: Cities(*),
            user: Users(*),
            primaryContact: Contacts!Companies_primary_contact_id_fkey(*),
            contacts: Contacts!Contacts_company_id_fkey(*)
            `
            )
            .eq('id', id)
            .single(),
        supabase
            .from('Opportunities')
            .select(
                `
                *,
                status: Opportunity_Statuses(*)
                `
            )
            .eq('company_id', id)
            .order('created_at', { ascending: false }),
    ]);

    if (companyRes.error) {
        console.error('Error getting company:', companyRes.error);
        throw createError({ status: 400, statusMessage: companyRes.error.message });
    }

    if (opportunitiesRes.error) {
        console.error('Error getting opportunities:', opportunitiesRes.error);
        throw createError({ status: 400, statusMessage: opportunitiesRes.error.message });
    }

    const { data: companyData } = companyRes;
    const { data: opportunitiesData } = opportunitiesRes;

    return { ...companyData, opportunities: opportunitiesData };
});

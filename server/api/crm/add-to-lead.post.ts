import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';
import { addToLeadSchema } from '~/utils/validators/crm';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, addToLeadSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const reqData = zodResult.data;

    const [companyStatusRes, contactStatusRes, leadStatusRes, ratingRes, sourceRes] = await Promise.all([
        supabase.from('Company_Statuses').select('id').eq('name', 'new').single(),
        supabase.from('Contact_Statuses').select('id').eq('name', 'new').single(),
        supabase.from('Lead_Statuses').select('id').eq('name', 'qualified').single(),
        supabase.from('Ratings').select('id').eq('name', 'hot').single(),
        supabase.from('Ratings').select('id').eq('name', 'cool').single(),
        supabase.from('Sources').select('id').eq('name', 'manual').single(),
    ]);
    if (companyStatusRes.error) {
        console.error('Error fetching company status:', companyStatusRes.error);
        throw createError({ status: 500, statusMessage: companyStatusRes.error.message });
    }
    if (contactStatusRes.error) {
        console.error('Error fetching contact status:', contactStatusRes.error);
        throw createError({ status: 500, statusMessage: contactStatusRes.error.message });
    }
    if (leadStatusRes.error) {
        console.error('Error fetching lead status:', leadStatusRes.error);
        throw createError({ status: 500, statusMessage: leadStatusRes.error.message });
    }
    if (ratingRes.error) {
        console.error('Error fetching rating:', ratingRes.error);
        throw createError({ status: 500, statusMessage: ratingRes.error.message });
    }
    if (sourceRes.error) {
        console.error('Error fetching source:', sourceRes.error);
        throw createError({ status: 500, statusMessage: sourceRes.error.message });
    }

    const { data: company, error: insertCompanyError } = await supabase
        .from('Companies')
        .insert({
            ...reqData.company,
            user_id: user.id,
            company_status_id: companyStatusRes.data.id,
            organization_id: user.user_metadata.organization_id,
        })
        .select()
        .single();
    if (insertCompanyError) {
        console.error('Error creating company:', insertCompanyError);
        throw createError({ status: 500, statusMessage: insertCompanyError.message });
    }

    const { data: contact, error: contactError } = await supabase
        .from('Contacts')
        .insert({
            ...reqData.contact,
            company_id: company.id,
            user_id: user.id,
            contact_status_id: contactStatusRes.data.id,
            organization_id: user.user_metadata.organization_id,
        })
        .select('id')
        .single();
    if (contactError) {
        console.error('Error creating contact:', contactError);
        throw createError({ status: 500, statusMessage: contactError.message });
    }

    const { error: leadError } = await supabase
        .from('Leads')
        .insert({
            company_id: company.id,
            contact_id: contact.id,
            lead_status_id: leadStatusRes.data.id,
            organization_id: user.user_metadata.organization_id,
            rating_id: ratingRes.data.id,
            source_id: sourceRes.data.id,
            user_id: user.id,
        })
        .select()
        .single();
    if (leadError) {
        console.error('Error creating lead:', leadError);
        throw createError({ status: 500, statusMessage: leadError.message });
    }
});

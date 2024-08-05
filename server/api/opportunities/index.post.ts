import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { addOpportunitySchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, addOpportunitySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { company_id, email, first_name, last_name, phone } = zodResult.data;

    const [ratingRes, opportunityStatusRes] = await Promise.all([
        supabase.from('Ratings').select('id').eq('name', 'cool').single(),
        supabase.from('Opportunity_Statuses').select('id').order('index_number', { ascending: false }).limit(1).single(),
    ]);
    if (ratingRes.error) {
        console.error('Error fetching rating:', ratingRes.error);
        throw createError({ status: 500, statusMessage: ratingRes.error.message });
    }
    if (opportunityStatusRes.error) {
        console.error('Error fetching opportunity status:', opportunityStatusRes.error);
        throw createError({ status: 500, statusMessage: opportunityStatusRes.error.message });
    }

    const contactRes = await supabase
        .from('Contacts')
        .insert({
            company_id,
            first_name,
            last_name,
            email,
            mobile_phone: phone,
            organization_id: user.user_metadata.organization_id,
            user_id: user.id,
        })
        .select('id')
        .single();
    if (contactRes.error) {
        console.error('Error creating contact:', contactRes.error);
        throw createError({ status: 500, statusMessage: contactRes.error.message });
    }

    const leadRes = await supabase
        .from('Leads')
        .insert({
            company_id,
            contact_id: contactRes.data.id,
            status: 'new',
            rating_id: ratingRes.data.id,
            source: 'manual',
            organization_id: user.user_metadata.organization_id,
            user_id: user.id,
        })
        .select()
        .single();
    if (leadRes.error) {
        console.error('Error creating lead:', leadRes.error);
        throw createError({ status: 500, statusMessage: leadRes.error.message });
    }

    // eslint-disable-next-line prefer-const
    let { data: maxIndexOpportunity, error } = await supabase
        .from('Opportunities')
        .select('index_number')
        .match({
            opportunity_status_id: opportunityStatusRes.data.id,
            organization_id: user.user_metadata.organization_id,
        })
        .order('index_number', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching max index opportunity (SERVER)', error);
        throw createError({
            status: 500,
            statusMessage: error.message,
        });
    }

    const opportunityRes = await supabase.from('Opportunities').insert({
        company_id,
        contact_id: contactRes.data.id,
        lead_id: leadRes.data.id,
        opportunity_status_id: opportunityStatusRes.data.id,
        rating_id: ratingRes.data.id,
        index_number: maxIndexOpportunity ? maxIndexOpportunity.index_number + 1 : 1,
        organization_id: user.user_metadata.organization_id,
        user_id: user.id,
    });
    if (opportunityRes.error) {
        console.error('Error creating opportunity:', opportunityRes.error);
        throw createError({ status: 500, statusMessage: opportunityRes.error.message });
    }
});

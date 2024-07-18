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

    const { company_id, email, first_name, last_name, organization_id, topic, user_id, phone } = zodResult.data;

    const [contactStatusRes, ratingRes, sourceRes, opportunityStatusRes] = await Promise.all([
        supabase.from('Contact_Statuses').select('id').eq('name', 'new').single(),
        supabase.from('Ratings').select('id').eq('name', 'cool').single(),
        supabase.from('Sources').select('id').eq('name', 'manual').single(),
        supabase.from('Opportunity_Statuses').select('id').order('index_number', { ascending: false }).limit(1).single(),
    ]);
    if (contactStatusRes.error) {
        console.error('Error fetching contact status:', contactStatusRes.error);
        throw createError({ status: 500, statusMessage: contactStatusRes.error.message });
    }
    if (ratingRes.error) {
        console.error('Error fetching rating:', ratingRes.error);
        throw createError({ status: 500, statusMessage: ratingRes.error.message });
    }
    if (sourceRes.error) {
        console.error('Error fetching source:', sourceRes.error);
        throw createError({ status: 500, statusMessage: sourceRes.error.message });
    }
    if (opportunityStatusRes.error) {
        console.error('Error fetching opportunity status:', opportunityStatusRes.error);
        throw createError({ status: 500, statusMessage: opportunityStatusRes.error.message });
    }

    const contactRes = await supabase
        .from('Contacts')
        .insert({
            company_id,
            contact_status_id: contactStatusRes.data.id,
            organization_id,
            user_id,
            first_name,
            last_name,
            email,
            mobile_phone: phone,
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
            organization_id,
            rating_id: ratingRes.data.id,
            source_id: sourceRes.data.id,
            user_id,
            topic,
        })
        .select()
        .single();
    if (leadRes.error) {
        console.error('Error creating lead:', leadRes.error);
        throw createError({ status: 500, statusMessage: leadRes.error.message });
    }

    const { data: maxIndexOpportunity, error } = await supabase
        .from('Opportunities')
        .select('index_number')
        .match({
            organization_id,
            opportunity_status_id: opportunityStatusRes.data.id,
        })
        .order('index_number', { ascending: false })
        .limit(1)
        .single();
    if (error) {
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
        organization_id,
        rating_id: ratingRes.data.id,
        user_id,
        topic,
        index_number: maxIndexOpportunity ? maxIndexOpportunity.index_number + 1 : 1,
    });
    if (opportunityRes.error) {
        console.error('Error creating opportunity:', opportunityRes.error);
        throw createError({ status: 500, statusMessage: opportunityRes.error.message });
    }
});

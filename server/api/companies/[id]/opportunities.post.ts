import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { addCompanyOpportunitySchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, addCompanyOpportunitySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const supabase = await serverSupabaseClient<Database>(event);

    const { company_id, contact_id, opportunity_status_id, payment_plan_id, topic, confidence, est_revenue } = zodResult.data;

    const [ratingHotRes, ratingCoolRes, sourceRes] = await Promise.all([
        supabase.from('Ratings').select('id').eq('name', 'hot').single(),
        supabase.from('Ratings').select('id').eq('name', 'cool').single(),
        supabase.from('Sources').select('id').eq('name', 'manual').single(),
    ]);
    if (ratingHotRes.error) {
        console.error('Error fetching hot rating:', ratingHotRes.error);
        throw createError({ status: 500, statusMessage: ratingHotRes.error.message });
    }
    if (ratingCoolRes.error) {
        console.error('Error fetching cool rating:', ratingCoolRes.error);
        throw createError({ status: 500, statusMessage: ratingCoolRes.error.message });
    }
    if (sourceRes.error) {
        console.error('Error fetching source:', sourceRes.error);
        throw createError({ status: 500, statusMessage: sourceRes.error.message });
    }

    const { data: lead, error: leadError } = await supabase
        .from('Leads')
        .insert({
            company_id,
            contact_id,
            status: 'qualified',
            rating_id: ratingHotRes.data.id,
            source_id: sourceRes.data.id,
            organization_id: user.user_metadata.organization_id,
            user_id: user.id,
        })
        .select('*')
        .single();
    if (leadError) {
        console.error('Error inserting lead:', leadError);
        throw createError({ status: 500, statusMessage: leadError.message });
    }

    const { data: maxIndexOpportunity, error } = await supabase
        .from('Opportunities')
        .select('index_number')
        .match({
            opportunity_status_id,
            organization_id: user.user_metadata.organization_id,
        })
        .order('index_number', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching max index opportunity statuses (SERVER)', error);
        throw createError({
            status: 500,
            statusMessage: error.message,
        });
    }

    const res = await supabase.from('Opportunities').insert({
        company_id,
        contact_id,
        opportunity_status_id,
        payment_plan_id,
        topic,
        confidence,
        est_revenue,
        lead_id: lead.id,
        rating_id: ratingCoolRes.data.id,
        index_number: maxIndexOpportunity ? maxIndexOpportunity.index_number + 1 : 1,
        organization_id: user.user_metadata.organization_id,
        user_id: user.id,
    });
    if (res.error) {
        console.error('Error inserting opportunity:', res.error);
        throw createError({ status: 500, statusMessage: res.error.message });
    }
});

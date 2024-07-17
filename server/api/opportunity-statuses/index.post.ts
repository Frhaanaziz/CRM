import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { createOpportunityStatusSchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, createOpportunityStatusSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { data: maxIndexStatus, error } = await supabase
        .from('Opportunity_Statuses')
        .select('index_number')
        .eq('organization_id', user.user_metadata.organization_id)
        .order('index_number', { ascending: false })
        .limit(1)
        .single();
    if (error) {
        console.error('Error fetching max index opportunity statuses (SERVER)', error);
        throw createError({
            status: 500,
            statusMessage: error.message,
        });
    }

    const res = await supabase.from('Opportunity_Statuses').insert({
        ...zodResult.data,
        organization_id: user.user_metadata.organization_id,
        index_number: maxIndexStatus ? maxIndexStatus.index_number + 1 : 1,
    });
    if (res.error) {
        console.error('Error create opportunity status (SERVER):', res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }
});

import { serverSupabaseClient } from '#supabase/server';
import { addCompanySchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, addCompanySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { data: companyStatus, error: companyStatusError } = await supabase
        .from('Company_Statuses')
        .select('id')
        .eq('name', 'new')
        .single();
    if (companyStatusError) {
        console.error('Error fetching company status:', companyStatusError);
        throw createError({ status: 500, statusMessage: companyStatusError.message });
    }

    const { data: company, error: insertError } = await supabase
        .from('Companies')
        .insert({
            ...zodResult.data,
            company_status_id: companyStatus.id,
        })
        .select('*')
        .single();
    if (insertError) {
        console.error('Error inserting company:', insertError);
        throw createError({ status: 400, statusMessage: insertError.message });
    }

    return company;
});

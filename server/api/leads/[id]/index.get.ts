import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params!.id;

    const [leadResponse, tasksResponse] = await Promise.all([
        supabase
            .from('Leads')
            .select(
                `
                *,
                contact: Contacts(*),
                company: Companies(
                                    *,
                                    industry: Industries(name),
                                    size: Sizes(size_range),
                                    country: Countries(name),
                                    province: Provinces(name),
                                    city: Cities(name)
                                ),
                source: Sources(*),
                rating: Ratings(*),
                status: Lead_Statuses(*),
                user: Users(*),
                disqualify_reason: Disqualify_Reasons(*)
                `
            )
            .eq('id', id)
            .single(),
        supabase
            .from('Tasks')
            .select(
                `
                id,
                date,
                description,
                is_completed,
                user: Users(*)
                `
            )
            .eq('lead_id', id)
            .order('created_at', { ascending: false }),
    ]);

    if (leadResponse.error) {
        console.error('Error getting lead:', leadResponse.error);
        throw createError({ status: 400, statusMessage: leadResponse.error.message });
    }

    if (tasksResponse.error) {
        console.error('Error getting tasks:', tasksResponse.error);
        throw createError({ status: 400, statusMessage: tasksResponse.error.message });
    }

    const { data: leadData } = leadResponse;
    const { data: tasksData } = tasksResponse;

    return { ...leadData, tasks: tasksData };
});

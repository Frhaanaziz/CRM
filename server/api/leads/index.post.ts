import { serverSupabaseClient } from '#supabase/server';
import { addLeadSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(
        event,
        addLeadSchema.omit({ email: true, first_name: true, last_name: true }).safeParse
    );
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    // eslint-disable-next-line prefer-const
    let { data: leadStatus, error: leadStatusError } = await supabase
        .from('Lead_Statuses')
        .select('id')
        .eq('name', 'new')
        .single();
    if (leadStatusError) {
        console.error('Error fetching lead status:', leadStatusError);
        throw createError({ status: 500, statusMessage: leadStatusError.message });
    }

    if (!leadStatus) {
        const { data: newStatus, error } = await supabase.from('Lead_Statuses').insert({ name: 'new' }).select('id').single();
        if (error) {
            console.error('Error inserting new lead status:', error);
            throw createError({ status: 500, statusMessage: error.message });
        }

        leadStatus = newStatus;
    }

    // eslint-disable-next-line prefer-const
    let { data: source, error: sourceError } = await supabase.from('Sources').select('id').eq('name', 'manual').single();
    if (sourceError) {
        console.error('Error fetching source:', sourceError);
        throw createError({ status: 500, statusMessage: sourceError.message });
    }

    if (!source) {
        const { data: newSource, error } = await supabase.from('Sources').insert({ name: 'manual' }).select('id').single();
        if (error) {
            console.error('Error inserting new source:', error);
            throw createError({ status: 500, statusMessage: error.message });
        }

        source = newSource;
    }

    // eslint-disable-next-line prefer-const
    let { data: rating, error: ratingError } = await supabase.from('Ratings').select('id').eq('name', 'cool').single();
    if (ratingError) {
        console.error('Error fetching rating:', ratingError);
        throw createError({ status: 500, statusMessage: ratingError.message });
    }

    if (!rating) {
        const { data: newRating, error } = await supabase.from('Ratings').insert({ name: 'cool' }).select('id').single();
        if (error) {
            console.error('Error inserting new rating:', error);
            throw createError({ status: 500, statusMessage: error.message });
        }

        rating = newRating;
    }

    const { error: insertError } = await supabase.from('Leads').insert({
        ...zodResult.data,
        lead_status_id: leadStatus.id,
        source_id: source.id,
        rating_id: rating.id,
    });
    if (insertError) {
        console.error('Error inserting lead:', insertError);
        throw createError({ status: 400, statusMessage: insertError.message });
    }
});

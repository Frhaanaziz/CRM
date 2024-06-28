import { serverSupabaseClient } from '#supabase/server';
import { addTaskSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, addTaskSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { data, error } = await supabase
        .from('Tasks')
        .insert({
            ...zodResult.data,
            date: zodResult.data.date.toISOString(),
        })
        .select('*')
        .single();
    if (error) {
        console.error('Error inserting task:', error);
        throw createError({ status: 400, statusMessage: error.message });
    }

    return data;
});

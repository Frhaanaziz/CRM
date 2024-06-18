import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const formData = await readFormData(event);
    const photo = formData.get('photo') as File;
    if (!photo) throw createError({ status: 400, statusMessage: 'Photo is needed' });

    const { data: user, error: userError } = await supabase.from('Users').select().eq('id', id).single();
    if (userError) {
        console.error('Error getting user', userError.message);
        throw createError({ status: 500, statusMessage: userError.message });
    }

    if (user.photo) {
        const fileName: string = user.photo.split('/').pop() as string;

        const { error: deleteError } = await supabase.storage.from('Avatars').remove([fileName]);
        if (deleteError) throw createError({ status: 500, statusMessage: deleteError.message });
    }

    const { data: uploadPath, error: uploadError } = await supabase.storage.from('Avatars').upload(`${photo.name}${id}`, photo);
    if (uploadError) {
        console.error('Error uploading file to storage', uploadError.message);
        throw createError({ status: 500, statusMessage: uploadError.message });
    }

    const { data: url } = supabase.storage.from('Avatars').getPublicUrl(uploadPath.path);

    const { error: updateError } = await supabase
        .from('Users')
        .update({
            photo: url.publicUrl,
        })
        .eq('id', id);
    if (updateError) throw createError({ status: 500, statusMessage: updateError.message });

    const { error: authUserError } = await supabase.auth.updateUser({
        data: {
            photo: url.publicUrl,
        },
    });
    if (authUserError) throw createError({ status: 500, statusMessage: authUserError.message });

    await supabase.auth.refreshSession();

    return url.publicUrl;
});

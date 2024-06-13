import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    // get user id from params
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    // get file from request
    const formData = await readFormData(event);
    const photo: File = formData.get('photo') as File;

    // upload file to supabase storage
    const { data: uploadPath, error: uploadError } = await supabase.storage.from('avatars').upload(`${photo.name}${id}`, photo);
    if (uploadError) throw createError({ status: 500, statusMessage: uploadError.message });

    // get public url of uploaded file
    const { data: url } = supabase.storage.from('avatars').getPublicUrl(uploadPath.path);

    // prepare update user data for kinde
    const inputBody = {
        picture: url.publicUrl,
    };

    // get access token from kinde
    const token = await getAccessToken();

    // update user in kinde
    const response = await $fetch(`${process.env.KINDE_API_URL}/api/v1/user?id=${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(inputBody),
    });
    if (!response) throw createError({ status: 500, statusMessage: 'Failed to update user' });

    // get user from supabase
    const { data: photoUser, error: photoError } = await supabase.from('Users').select('photo').eq('id', id).single();
    if (photoError) throw createError({ status: 500, statusMessage: photoError.message });
    if (photoUser) {
        // get photo file name
        const fileName: string = photoUser.photo!.split('/').pop() as string;

        // delete old photo from supabase storage
        const { error: deleteError } = await supabase.storage.from('avatars').remove([fileName]);
        if (deleteError) throw createError({ status: 500, statusMessage: deleteError.message });
    }

    // update user with new photo
    const { error: updateError } = await supabase
        .from('Users')
        .update({
            photo: url.publicUrl,
        })
        .eq('id', id);
    if (updateError) throw createError({ status: 500, statusMessage: updateError.message });

    return url.publicUrl;
});

import { serverSupabaseSession } from '#supabase/server';
import type { EventHandlerRequest, H3Event } from 'h3';

export const backendApi = async (event: H3Event<EventHandlerRequest>) => {
    const access_token = (await serverSupabaseSession(event))?.access_token;
    const runtimeConfig = useRuntimeConfig();

    return $fetch.create({
        baseURL: runtimeConfig.BACKEND_URL,
        onRequest({ options }) {
            if (access_token) {
                const headers = (options.headers ||= {});
                if (Array.isArray(headers)) {
                    headers.push(['Authorization', `Bearer ${access_token}`]);
                } else if (headers instanceof Headers) {
                    headers.set('Authorization', `Bearer ${access_token}`);
                } else {
                    headers.Authorization = `Bearer ${access_token}`;
                }
            }
        },
        //     async onResponseError({ response }) {
        //         // if (response.status === 401) {
        //         //     await navigateTo('/auth/signin');
        //         // }
        //     },
    });
};
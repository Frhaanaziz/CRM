import { serverSupabaseSession } from '#supabase/server';
import type { EventHandlerRequest, H3Event } from 'h3';
import { getErrorMessage } from '~/utils';

/**
 * Makes a request to the backend API.
 *
 * @param event - The event object containing the request details.
 * @returns A promise that resolves to the response from the backend API.
 */
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
        async onResponseError({ response }) {
            console.error('Error response:', response._data?.errors);
        },
    });
};

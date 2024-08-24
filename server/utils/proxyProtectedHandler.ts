import type { EventHandler, EventHandlerRequest } from 'h3';
import { serverSupabaseSession } from '#supabase/server';
import { joinURL } from 'ufo';

export const defineProxyProtectedHandler = <T extends EventHandlerRequest, D>(): EventHandler<T, D> =>
    defineEventHandler<T>(async (event) => {
        const access_token = (await serverSupabaseSession(event))?.access_token;

        const proxyUrl = useRuntimeConfig().BACKEND_URL;

        const path = event.path.replace(/^\/api\//, '');
        const target = joinURL(proxyUrl, path);

        return proxyRequest(event, target, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    });

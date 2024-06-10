import jwt from 'jsonwebtoken';

/**
 * Defines a Nuxt plugin that provides an API instance with authentication headers.
 */
export default defineNuxtPlugin(() => {
    const auth = useAuth();
    const userId = auth.user?.id;
  
    const api = $fetch.create({
        /**
         * Adds the authentication token to the request headers if the user is authenticated.
         * @param options - The request options.
         */
        onRequest({ options }) {
            if (userId) {
                const { JWT_SECRET } = useRuntimeConfig();
                const token = jwt.sign({ id: userId }, JWT_SECRET);

                const headers = (options.headers ||= {});
                if (Array.isArray(headers)) {
                    headers.push(['Authorization', `Bearer ${token}`]);
                } else if (headers instanceof Headers) {
                    headers.set('Authorization', `Bearer ${token}`);
                } else {
                    headers.Authorization = `Bearer ${token}`;
                }
            }
        },
        
        /**
         * Handles the response error with status code 401 (Unauthorized) by navigating to the sign-in page.
         * @param response - The response object.
         */
        async onResponseError({ response }) {
            if (response.status === 401) {
                await navigateTo('/auth/signin');
            }
        },
    });

    // Expose to useNuxtApp().$api
    return {
        provide: {
            api,
        },
    };
});

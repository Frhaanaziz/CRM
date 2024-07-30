// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],

    routeRules: {
        '/': { redirect: '/dashboard' },
        '/dashboard': { redirect: '/dashboard/inbox' },
    },

    runtimeConfig: {
        BACKEND_URL: process.env.NUXT_BACKEND_URL,
        TWILIO_BACKEND_URL: process.env.NUXT_TWILIO_BACKEND_URL,
        public: {
            BASE_URL: process.env.NUXT_PUBLIC_BASE_URL,
        },
    },

    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
        },
    },

    tailwindcss: {
        viewer: false,
    },

    ui: {
        icons: ['heroicons'],
    },

    // UI module options
    colorMode: {
        preference: 'light',
    },

    // TypeScript module options
    typescript: {
        typeCheck: true,
    },

    // Supabase module options
    supabase: {
        redirect: false,
        types: './types/supabase.d.ts',
    },

    compatibilityDate: '2024-07-24',
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@nuxt/eslint', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/image'],

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
    redirectOptions: {
      login: '/auth/signin',
      callback: '/auth/callback',
      include: ['/', '/dashboard(/*)?'],
    },
  },
});

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/first-attribute-linebreak': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
  },
});
// Your custom configs here

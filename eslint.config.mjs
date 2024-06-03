// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/first-attribute-linebreak': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
});
// Your custom configs here

// @ts-check
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            ...eslintConfigPrettier.rules,

            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            'vue/html-self-closing': 'off',
            'vue/attribute-hyphenation': 'off',
            'prefer-const': 'warn',
            'vue/prop-name-casing': 'off',
        },
    },
]);

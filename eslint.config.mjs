// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
    rules: {
        // 'vue/first-attribute-linebreak': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        'vue/html-self-closing': 'off',
        'vue/attribute-hyphenation': 'off',
        'prefer-const': 'warn',
    },
});
// Your custom configs here

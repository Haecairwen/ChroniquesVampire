import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
    {
        ignores: ['dist/', 'node_modules/', 'coverage/'],
    },
    js.configs.recommended,
    ...pluginVue.configs['flat/vue2-essential'],
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['tests/unit/**/*.spec.js'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];

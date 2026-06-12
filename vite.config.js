import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/ChroniquesVampire/' : '/',
    plugins: [
        vue(),
        tailwindcss(),
    ],
    resolve: {
        // The codebase imports SFCs without their .vue extension (a vue-cli
        // convention), so .vue has to take part in extension resolution.
        extensions: ['.mjs', '.js', '.json', '.vue'],
        alias: {
            Components: fileURLToPath(new URL('./src/components', import.meta.url)),
            Stores: fileURLToPath(new URL('./src/store', import.meta.url)),
            Libs: fileURLToPath(new URL('./src/lib', import.meta.url)),
            Migrations: fileURLToPath(new URL('./src/migrations', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        restoreMocks: true,
        mockReset: true,
        include: ['tests/unit/**/*.spec.js'],
        setupFiles: ['tests/setup.js'],
    },
}));

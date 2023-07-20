import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'tabulator-tables': ['tabulator-tables'],
                },
            },
        },
    },
    plugins: [
        svelte(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [],
            manifest: {
                name: 'My Song Repertory',
                short_name: 'Song Repo',
                start_url: '/',
                description: 'Your tool to keep an overview of your song repertory.',
                display: 'standalone',
                background_color: '#E9E3D6',
                theme_color: '#A71908',
                lang: 'en',
                scope: '/',
                categories: ['music', 'personalization', 'utilities'],
                icons: [
                    {
                        src: 'logo-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                screenshots: [
                    {
                        src: 'images/screenshot.png',
                        sizes: '800x600',
                        platform: 'windows',
                        label: 'Song list grouped by genre',
                    },
                ],
                display_override: ['window-controls-overlay'],
                orientation: 'natural',
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
                globIgnores: ['**/node_modules/**/*'],
            },
            devOptions: { enabled: true },
            selfDestroying: false,
        }),
    ],
});

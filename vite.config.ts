import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['logo.svg'],
            manifest: {
                name: 'My Song Repertoire',
                short_name: 'Song Repo',
                description:
                    'Your tool to keep an overview of your song repertoire.',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#109392',
                icons: [
                    {
                        src: 'logo-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
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

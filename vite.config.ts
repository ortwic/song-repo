import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'firebase': ['firebase/app', 'firebase/auth', 'firebase/analytics'],
                    'firestore': ['firebase/firestore'],
                    'tabulator-tables': ['tabulator-tables'],
                },
            },
        },
    },
    plugins: [
        svelte(),
        {
            name: 'vite-plugin-package-version',
            config: (_, env) => {
                if (env) {
                    return {
                        define: { 
                            ['import.meta.env.PACKAGE_VERSION']: JSON.stringify(process.env.npm_package_version), 
                            ['import.meta.env.FIRESTORE_EMULATOR_HOST']: JSON.stringify(process.env.FIRESTORE_EMULATOR_HOST),
                            ['import.meta.env.AUTH_EMULATOR_HOST']: JSON.stringify(process.env.AUTH_EMULATOR_HOST)
                        }
                    };
                }
            }
        },
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [],
            manifest: {
                name: 'My Song Repertory',
                short_name: 'Song Repo',
                start_url: '/',
                description: 'Your tool to keep an overview of your song repertory.',
                display: 'fullscreen',
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
                    {
                        src: 'logo-mono.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'monochrome',
                    },
                ],
                screenshots: [
                    {
                        src: 'images/songlist.png',
                        sizes: '1040x763',
                        platform: 'windows',
                        label: 'Song list grouped by genre',
                    },
                    {
                        src: 'images/start.png',
                        sizes: '1040x763',
                        platform: 'windows',
                        label: 'Homepage with feature overview',
                    },
                    {
                        src: 'images/musicblog.png',
                        sizes: '1040x763',
                        platform: 'windows',
                        label: 'Music blog',
                    },
                ],
                display_override: ['window-controls-overlay'],
                orientation: 'any',
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,gif,jpg,jpeg,png,webp,woff2}'],
                globIgnores: ['**/node_modules/**/*'],
                runtimeCaching: [{
                    urlPattern: /^https:\/\/storage\.googleapis\.com\/song-repo\.appspot\.com/,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'song-repo-images',
                        expiration: {
                            maxEntries: 100,
                            maxAgeSeconds: 60 * 60 * 24 * 90
                        }
                    }
                }]
            },
            devOptions: { 
                // true is very verbose in console
                enabled: false
            },
            selfDestroying: false,
        }),
    ],
});

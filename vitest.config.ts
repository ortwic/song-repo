import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST }) as any],
    test: {
        globals: true,
        include: ['./src/**/*.{test,spec}.ts'],
        // coverage: {
        //   all: true,
        //   enabled: true,
        //   statements: 80,
        //   branches: 80,
        //   functions: 80,
        //   lines: 80,
        //   include: ['src/**/*.{ts,svelte}'],
        //   exclude: ['src/**/*.{config,d,model,spec,test}.ts'],
        //   provider: 'v8',
        //   reporter: ['html']
        // },
        environment: 'happy-dom',
        setupFiles: ['src/setuptest.ts'],
    },
    resolve: process.env.VITEST ? {
        conditions: ['browser']
    } : undefined
});

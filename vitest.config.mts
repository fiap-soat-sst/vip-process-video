import { defineConfig } from 'vitest/config';


export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.spec.ts'],
        poolOptions: {
            threads: {
                maxThreads: 1,
            },
        },
    },
})
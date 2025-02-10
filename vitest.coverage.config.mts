import { defineConfig } from 'vitest/config';


export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.spec.ts'],
        coverage: {
            enabled: true,
            reporter: ['lcov', 'cobertura', 'text'],
            include: ['src/**/*.ts'],
            exclude: [
                '**/*.dto.ts',
                '**/Gateways/*',
                '**/Repositories/*',
                '**/Migrations/*',
                '**/External/Api/*',
            ],
        },
    },
})
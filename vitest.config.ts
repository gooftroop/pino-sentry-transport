import { defineConfig } from 'vitest/config';
// eslint-disable-next-line import/no-named-default
import { default as tsconfigPaths } from 'vite-tsconfig-paths';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    // @ts-expect-error fault in lib
    plugins: [tsconfigPaths()],
    test: {
        clearMocks: true,
        coverage: {
            reporter: ['cobertura'],
        },
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                resources: 'usable',
            },
        },
        globals: true,
        outputFile: { junit: 'junit.xml' },
        reporters: ['default', 'junit'],
    },
});

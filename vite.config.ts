import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

export default defineConfig( {
    resolve: {
        alias: {
            '@': resolve( __dirname, 'src' ),
        }
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ABMasonry',
            fileName: 'ab-masonry',
            formats: ['es'],
        },
        rollupOptions: {
            external: [],
            output: {
                assetFileNames: 'ab-masonry.css',
                exports: 'named',
            },
        },
    },
     test: {
         coverage: {
             provider: 'v8',
             reportsDirectory: './coverage',
             reporter: [ 'text', 'html' ],
         },
         setupFiles: [ 'tests/helpers/image-mock.ts' ],
         environment: 'jsdom',
         globals: true,
         include: [ 'tests/**/*.{test,spec}.ts' ],
    }
} );

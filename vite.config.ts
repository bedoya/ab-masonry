import { defineConfig } from 'vite';
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
                exports: 'default',
            },
        },
    },
} );

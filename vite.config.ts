import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig( {
    build: {
        lib: {
            entry: path.resolve( __dirname, 'src/index.ts' ),
            name: 'ABMasonry',
            fileName: 'index',
            formats: [ 'es', 'umd' ],
        },
        rollupOptions: {
            external: [],
            output: {
                assetFileNames: ( assetInfo ) => {
                    if ( assetInfo.name && assetInfo.name.endsWith( '.css' ) ) {
                        return 'style/[name].[ext]';
                    }
                    return '[name].[ext]';
                },
            },
        },
    },
    plugins: [ dts() ],
} );

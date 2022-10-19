#!/usr/bin/env node
/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';
import { build as esbuild } from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseConfig = {
    platform: 'node',
    target: 'esnext',
    format: 'cjs',
    nodePaths: [path.join(__dirname, '../src')],
    bundle: true,
    // minify: true,
    sourcemap: true,
    // external: ['./node_modules/*'],
    plugins: [nodeExternalsPlugin()],
};

async function main() {
    await esbuild({
        ...baseConfig,
        outfile: path.join(__dirname, '../dist/cjs/index.cjs'),
        entryPoints: [path.join(__dirname, '../src/index.ts')],
    });

    await esbuild({
        ...baseConfig,
        format: 'esm',
        outfile: path.join(__dirname, '../dist/esm/index.js'),
        entryPoints: [path.join(__dirname, '../src/index.ts')],
    });
}

main();

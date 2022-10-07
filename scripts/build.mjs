#!/usr/bin/env node
/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';
import { build as esbuild } from 'esbuild';

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
    external: ['@sentry/node', 'lodash.get', 'pino', 'split2', 'readable-stream'],
};

async function main() {
    await esbuild({
        ...baseConfig,
        outdir: path.join(__dirname, '../dist/cjs'),
        entryPoints: [path.join(__dirname, '../src/index.ts')],
    });

    await esbuild({
        ...baseConfig,
        format: 'esm',
        outdir: path.join(__dirname, '../dist/esm'),
        entryPoints: [path.join(__dirname, '../src/index.ts')],
    });
}

main();

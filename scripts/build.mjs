#!/usr/bin/env node
/* eslint-disable no-underscore-dangle */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseConfig = {
    platform: 'node',
    target: 'esnext',
    format: 'cjs',
    nodePaths: [path.join(__dirname, '../src')],
    bundle: true,
    minify: true,
    sourcemap: true,
    plugins: [nodeExternalsPlugin()],
};

function emitDeclarations(fileName, options) {
    const host = ts.createCompilerHost(options);

    host.writeFile = (declarationFileName, contents) => fs.writeFileSync(declarationFileName, contents);
    
    // Prepare and emit the d.ts files
    const program = ts.createProgram(fileName, options, host);

    program.emit();
}

async function main() {
    await esbuild({
        ...baseConfig,
        outfile: path.join(__dirname, '../dist/cjs/index.cjs'),
        entryPoints: [path.join(__dirname, '../src/index.ts')],
    });

    await esbuild({
        ...baseConfig,
        outfile: path.join(__dirname, '../dist/cjs/browser.cjs'),
        entryPoints: [path.join(__dirname, '../src/browser.ts')],
    });

    await esbuild({
        ...baseConfig,
        format: 'esm',
        outfile: path.join(__dirname, '../dist/esm/index.js'),
        entryPoints: [path.join(__dirname, '../src/index.ts')],
    });

    await esbuild({
        ...baseConfig,
        format: 'esm',
        outfile: path.join(__dirname, '../dist/esm/browser.js'),
        entryPoints: [path.join(__dirname, '../src/browser.ts')],
    });

    emitDeclarations([path.join(__dirname, '../src/index.ts')], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: path.join(__dirname, '../dist/cjs'),
        project: path.join(__dirname, '../tsconfig.build.json'),
    });

    emitDeclarations([path.join(__dirname, '../src/browser.ts')], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: path.join(__dirname, '../dist/cjs'),
        project: path.join(__dirname, '../tsconfig.build.json'),
    });

    emitDeclarations([path.join(__dirname, '../src/index.ts')], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: path.join(__dirname, '../dist/esm'),
        project: path.join(__dirname, '../tsconfig.build.json'),
    });

    emitDeclarations([path.join(__dirname, '../src/browser.ts')], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: path.join(__dirname, '../dist/esm'),
        project: path.join(__dirname, '../tsconfig.build.json'),
    });
}

main();

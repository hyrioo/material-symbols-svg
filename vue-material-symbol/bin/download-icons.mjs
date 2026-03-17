#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { cleanupMaterialSymbolsCache, syncMaterialSymbols } from '@hyrioo/vue-material-symbol/tooling';

function parseDownloadArgs(argv) {
  const out = {
    modulePath: null,
    exportName: 'Icons',
    root: process.cwd(),
    strict: false,
    concurrency: 8,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--export' && argv[i + 1]) {
      out.exportName = argv[++i];
      continue;
    }
    if (a === '--root' && argv[i + 1]) {
      out.root = path.resolve(argv[++i]);
      continue;
    }
    if (a === '--strict') {
      out.strict = true;
      continue;
    }
    if (a === '--concurrency' && argv[i + 1]) {
      out.concurrency = Number(argv[++i]) || 8;
      continue;
    }
    if (!a.startsWith('--') && !out.modulePath) {
      out.modulePath = a;
    }
  }

  return out;
}

function parseCleanupArgs(argv) {
  const out = {
    modulePath: null,
    exportName: 'Icons',
    root: process.cwd(),
    clearAll: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--export' && argv[i + 1]) {
      out.exportName = argv[++i];
      continue;
    }
    if (a === '--root' && argv[i + 1]) {
      out.root = path.resolve(argv[++i]);
      continue;
    }
    if (a === '--all') {
      out.clearAll = true;
      continue;
    }
    if (!a.startsWith('--') && !out.modulePath) {
      out.modulePath = a;
    }
  }

  return out;
}

function printUsage() {
  console.error('Usage: material-symbols <command> [options]');
  console.error('');
  console.error('Commands:');
  console.error('  download <icons-module.mjs> [--export Icons] [--root .] [--strict] [--concurrency 8]');
  console.error('  cleanup <icons-module.mjs> [--export Icons] [--root .] [--all]');
}

async function loadIcons(modulePath, exportName) {
  const abs = path.resolve(modulePath);
  const mod = await import(pathToFileURL(abs).href);
  return mod[exportName] ?? mod.default;
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command) {
    printUsage();
    process.exit(1);
  }

  if (command !== 'download' && command !== 'cleanup') {
    console.error(`[vue-material-symbol] Unknown command "${command}"`);
    printUsage();
    process.exit(1);
  }

  if (command === 'cleanup') {
    const args = parseCleanupArgs(argv.slice(1));
    if (!args.modulePath) {
      printUsage();
      process.exit(1);
    }

    const iconsDef = await loadIcons(args.modulePath, args.exportName);
    if (!iconsDef) {
      console.error(`[vue-material-symbol] Could not find export "${args.exportName}" (or default export) in ${args.modulePath}`);
      process.exit(1);
    }

    await cleanupMaterialSymbolsCache(iconsDef, {
      rootDir: args.root,
      clearAll: args.clearAll,
      logger: {
        info: (msg) => console.log(msg),
        warn: (msg) => console.warn(msg),
        error: (msg) => {
          throw new Error(msg);
        },
      },
    });
    return;
  }

  const args = parseDownloadArgs(argv.slice(1));
  if (!args.modulePath) {
    printUsage();
    process.exit(1);
  }

  const iconsDef = await loadIcons(args.modulePath, args.exportName);
  if (!iconsDef) {
    console.error(`[vue-material-symbol] Could not find export "${args.exportName}" (or default export) in ${args.modulePath}`);
    process.exit(1);
  }

  const result = await syncMaterialSymbols(iconsDef, {
    rootDir: args.root,
    strict: args.strict,
    concurrency: args.concurrency,
    logger: {
      info: (msg) => console.log(msg),
      warn: (msg) => console.warn(msg),
      error: (msg) => {
        throw new Error(msg);
      },
    },
  });

  if (result.failed > 0 && args.strict) {
    process.exit(1);
  }
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[vue-material-symbol] ${msg}`);
  process.exit(1);
});

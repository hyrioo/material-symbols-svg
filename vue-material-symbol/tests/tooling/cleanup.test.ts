import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupMaterialSymbolsCache } from '../../src/tooling/cleanup';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('cleanupMaterialSymbolsCache', () => {
  const iconsDef = {
    Symbols: {
      home: {
        sizes: [24],
        weights: [400],
        fills: [false],
        themes: ['rounded'],
      },
    },
  } as any;

  it('removes only stale symbol files', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mss-cleanup-'));
    tempDirs.push(root);

    const cacheDir = path.join(root, 'node_modules', '@hyrioo', 'vue-material-symbol', '.temp', 'symbols', 'rounded');
    await fs.mkdir(cacheDir, { recursive: true });
    const keepFile = path.join(cacheDir, 'home.w400.s24.svg');
    const staleFile = path.join(cacheDir, 'language.w400.s24.svg');
    await fs.writeFile(keepFile, '<svg />', 'utf8');
    await fs.writeFile(staleFile, '<svg />', 'utf8');

    const result = await cleanupMaterialSymbolsCache(iconsDef, { rootDir: root });

    expect(result.removedFiles).toBe(1);
    await expect(fs.access(keepFile)).resolves.toBeUndefined();
    await expect(fs.access(staleFile)).rejects.toThrow();
  });

  it('returns zero removals when cache is missing', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mss-cleanup-empty-'));
    tempDirs.push(root);

    const result = await cleanupMaterialSymbolsCache(iconsDef, { rootDir: root });

    expect(result.removedFiles).toBe(0);
    expect(result.scannedFiles).toBe(0);
    expect(result.symbolsPath).toContain(path.join('node_modules', '@hyrioo', 'vue-material-symbol', '.temp', 'symbols'));
  });

  it('removes all cached files with clearAll=true', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mss-cleanup-all-'));
    tempDirs.push(root);

    const cacheDir = path.join(root, 'node_modules', '@hyrioo', 'vue-material-symbol', '.temp', 'symbols', 'rounded');
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(path.join(cacheDir, 'home.w400.s24.svg'), '<svg />', 'utf8');
    await fs.writeFile(path.join(cacheDir, 'language.w400.s24.svg'), '<svg />', 'utf8');

    const result = await cleanupMaterialSymbolsCache(iconsDef, { rootDir: root, clearAll: true });

    expect(result.removedFiles).toBe(2);
    await expect(fs.access(path.join(root, 'node_modules', '@hyrioo', 'vue-material-symbol', '.temp', 'symbols'))).rejects.toThrow();
  });
});

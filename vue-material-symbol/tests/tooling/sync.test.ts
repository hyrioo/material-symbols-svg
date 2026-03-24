import { beforeEach, describe, expect, it, vi } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const { resolveMaterialSymbolMetadata } = vi.hoisted(() => ({
  resolveMaterialSymbolMetadata: vi.fn(async () => ({ unionType: "'home'", versions: { home: 1 } })),
}));

const { buildSymbolVariantMatrix } = vi.hoisted(() => ({
  buildSymbolVariantMatrix: vi.fn(() => []),
}));

const { writeArtifacts } = vi.hoisted(() => ({
  writeArtifacts: vi.fn(async () => ({ loaderMapSource: 'export default {};' })),
}));

const { downloadFromMatrix } = vi.hoisted(() => ({
  downloadFromMatrix: vi.fn(async () => ({ saved: 1, skipped: 2, failed: 0, failures: [] })),
}));

vi.mock('../../src/tooling/meta', () => ({
  resolveMaterialSymbolMetadata,
}));

vi.mock('../../src/tooling/core/matrix', () => ({
  buildSymbolVariantMatrix,
}));

vi.mock('../../src/tooling/core/artifacts', () => ({
  writeArtifacts,
}));

vi.mock('../../src/tooling/core/download', () => ({
  downloadFromMatrix,
}));

describe('syncMaterialSymbols', () => {
  beforeEach(() => {
    resolveMaterialSymbolMetadata.mockClear();
    buildSymbolVariantMatrix.mockClear();
    writeArtifacts.mockClear();
    downloadFromMatrix.mockClear();
  });

  it('runs canonical pipeline and returns download result', async () => {
    const { syncMaterialSymbols } = await import('../../src/tooling/sync');
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mss-sync-'));

    const result = await syncMaterialSymbols(
      {
        Symbols: {
          home: {
            sizes: [24, 40],
            weights: [400],
            fills: [false, true],
            themes: ['rounded'],
          },
        },
      } as any,
      { rootDir: root, concurrency: 4 },
    );

    expect(resolveMaterialSymbolMetadata).toHaveBeenCalledTimes(1);
    expect(buildSymbolVariantMatrix).toHaveBeenCalledTimes(1);
    expect(writeArtifacts).toHaveBeenCalledTimes(1);
    expect(downloadFromMatrix).toHaveBeenCalledTimes(1);
    expect(downloadFromMatrix.mock.calls[0]?.[1]?.concurrency).toBe(4);
    expect(result).toEqual({ saved: 1, skipped: 2, failed: 0 });
  });

  it('throws strict diagnostics error when downloads fail', async () => {
    downloadFromMatrix.mockResolvedValueOnce({
      saved: 0,
      skipped: 0,
      failed: 1,
      failures: ['[vue-material-symbol] Failed https://example.com -> /tmp/x.svg: HTTP 404'],
    });

    const { syncMaterialSymbols } = await import('../../src/tooling/sync');

    await expect(
      syncMaterialSymbols(
        { Symbols: { home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } } as any },
        { strict: true },
      ),
    ).rejects.toThrow('1 symbol download(s) failed');
  });

  it('provides loader map source through internal sync adapter', async () => {
    const { syncMaterialSymbolsInternal } = await import('../../src/tooling/sync');

    const result = await syncMaterialSymbolsInternal(
      { Symbols: { home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } } as any },
      {},
    );

    expect(result.loaderMapSource).toContain('export default');
  });
});

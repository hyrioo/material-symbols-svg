import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchVersions } = vi.hoisted(() => ({
  fetchVersions: vi.fn(async () => {}),
}));

const { generateConsumerFiles } = vi.hoisted(() => ({
  generateConsumerFiles: vi.fn(async () => ({ loaderMapContent: 'export default {};' })),
}));

const { downloadSymbols } = vi.hoisted(() => ({
  downloadSymbols: vi.fn(async () => ({ saved: 1, skipped: 2, failed: 0, toDownload: 1, failures: [] })),
}));

const mkdir = vi.fn(async () => {});

vi.mock('node:fs/promises', () => ({
  default: { mkdir },
  mkdir,
}));

vi.mock('../../src/tooling/meta', () => ({
  fetchVersions,
}));

vi.mock('../../src/tooling/registry', async () => {
  const actual = await vi.importActual<typeof import('../../src/tooling/registry')>('../../src/tooling/registry');
  return {
    ...actual,
    generateConsumerFiles,
  };
});

vi.mock('../../src/tooling/symbols', async () => {
  const actual = await vi.importActual<typeof import('../../src/tooling/symbols')>('../../src/tooling/symbols');
  return {
    ...actual,
    downloadSymbols,
  };
});

describe('syncMaterialSymbols', () => {
  beforeEach(() => {
    fetchVersions.mockClear();
    generateConsumerFiles.mockClear();
    downloadSymbols.mockClear();
    mkdir.mockClear();
  });

  it('returns early when disabled', async () => {
    const { syncMaterialSymbols } = await import('../../src/tooling/sync');

    const result = await syncMaterialSymbols({ Symbols: { home: { sizes: [24] } } as any }, { enabled: false });

    expect(result).toEqual({ saved: 0, skipped: 0, failed: 0 });
    expect(fetchVersions).not.toHaveBeenCalled();
    expect(generateConsumerFiles).not.toHaveBeenCalled();
    expect(downloadSymbols).not.toHaveBeenCalled();
  });

  it('passes generated tasks to downloader', async () => {
    const { syncMaterialSymbols } = await import('../../src/tooling/sync');

    await syncMaterialSymbols(
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
      { rootDir: '/repo', concurrency: 4 },
    );

    expect(fetchVersions).toHaveBeenCalledTimes(1);
    expect(generateConsumerFiles).toHaveBeenCalledTimes(1);
    expect(downloadSymbols).toHaveBeenCalledTimes(1);

    const [tasks, concurrency] = downloadSymbols.mock.calls[0];
    expect(tasks).toHaveLength(4);
    expect(concurrency).toBe(4);
    expect(tasks[0].url).toContain('https://fonts.gstatic.com/s/i/short-term/release/materialsymbols');
  });

  it('throws strict diagnostics error when downloads fail', async () => {
    downloadSymbols.mockResolvedValueOnce({
      saved: 0,
      skipped: 0,
      failed: 1,
      toDownload: 1,
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
});

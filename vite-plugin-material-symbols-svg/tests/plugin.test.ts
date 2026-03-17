import { afterEach, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';

const { syncMaterialSymbols } = vi.hoisted(() => ({
  syncMaterialSymbols: vi.fn(async () => ({ saved: 1, skipped: 0, failed: 0 })),
}));

vi.mock('@hyrioo/vue-material-symbol/tooling', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hyrioo/vue-material-symbol/tooling')>();
  return {
    ...actual,
    syncMaterialSymbols,
  };
});

import { materialSymbolsSvg } from '../src/plugin';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  syncMaterialSymbols.mockClear();
});

async function createIconsFile(root: string, relPath = 'icons.mjs', content?: string) {
  const abs = path.join(root, relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(
    abs,
    content ??
      "import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';\n" +
        'export default defineIcons(\n' +
        "  { home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } },\n" +
        '  {},\n' +
        "  { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] },\n" +
        ');',
    'utf8',
  );
  return abs;
}

describe('materialSymbolsSvg plugin', () => {
  it('throws when iconsFile is missing', () => {
    expect(() => materialSymbolsSvg({} as any)).toThrow('options.iconsFile is required');
  });

  it('does not register symbol path alias', () => {
    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });

    plugin.configResolved?.({ root: '/repo' } as any);
    const cfg = plugin.config?.({ resolve: { alias: {} } } as any) as any;
    expect(cfg.resolve).toBeUndefined();
  });

  it('excludes vue-material-symbol from optimizeDeps', () => {
    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    const cfg = plugin.config?.({ optimizeDeps: { exclude: ['some-other-dep'] } } as any) as any;

    expect(cfg.optimizeDeps.exclude).toEqual(
      expect.arrayContaining([
        'some-other-dep',
        '@hyrioo/vue-material-symbol',
        '@hyrioo/vue-material-symbol/consumer',
      ]),
    );
  });

  it('triggers syncMaterialSymbols in buildStart using default export from iconsFile', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs', strict: true });
    plugin.configResolved?.({ root, command: 'build' } as any);

    const ctx = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn((msg: string) => {
        throw new Error(msg);
      }),
      addWatchFile: vi.fn(),
    };

    await plugin.buildStart?.call(ctx as any);

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(1);
    const [icons, opts] = syncMaterialSymbols.mock.calls[0];
    expect(icons.Symbols.home).toBeDefined();
    expect(opts.rootDir).toBe(root);
    expect(opts.strict).toBe(true);
    expect(opts.diagnostics).toBe('dev');
    expect(opts.virtualLoaderMap).toBe(true);
    expect(typeof opts.onLoaderMapGenerated).toBe('function');
    expect(ctx.addWatchFile).toHaveBeenCalledWith(path.join(root, 'icons.mjs'));
  });

  it('throws when iconsFile has no default export defineIcons result', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-invalid-'));
    tempDirs.push(root);
    await createIconsFile(root, 'icons.mjs', 'export const Icons = { Symbols: { home: {} } };');

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);

    await expect(
      plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any),
    ).rejects.toThrow('iconsFile must default export defineIcons(...)');
  });

  it('supports custom svg file sources in iconsFile', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-custom-svg-import-'));
    tempDirs.push(root);
    await fs.mkdir(path.join(root, 'custom'), { recursive: true });
    await fs.writeFile(
      path.join(root, 'custom', 'spark.svg'),
      '<svg viewBox="0 0 24 24"><path id="spark" d="M0 0h24v24H0z"/></svg>',
      'utf8',
    );
    await createIconsFile(
      root,
      'icons.mjs',
      "import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';\n" +
        'export default defineIcons(\n' +
        "  { home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } },\n" +
        "  { spark: { 24: { __hyriooSvgFile: './custom/spark.svg' } } },\n" +
        "  { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] },\n" +
        ');',
    );

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);
    const addWatchFile = vi.fn();
    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile } as any);

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(1);
    const [icons] = syncMaterialSymbols.mock.calls[0];
    expect(icons.Custom.spark[24]).toEqual({ __hyriooSvgFile: './custom/spark.svg' });
    expect(addWatchFile).toHaveBeenCalledWith(path.join(root, 'custom', 'spark.svg'));
  });

  it('serves loader map as virtual module', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-virtual-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);

    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any);

    const resolved = plugin.resolveId?.('./loader-map.js', '/repo/node_modules/@hyrioo/vue-material-symbol/dist/consumer.js');
    expect(resolved).toBe('\u0000virtual:material-symbols-loader-map');
    const loaded = plugin.load?.('\u0000virtual:material-symbols-loader-map');
    expect(typeof loaded).toBe('string');
  });

  it('does not serve loader map for encoded virtual id path', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-virtual-encoded-id-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);
    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any);

    const loaded = plugin.load?.('/dist/@id/__x00__virtual:material-symbols-loader-map');
    expect(loaded).toBeNull();
  });

  it('falls back to default export when generated loader map source is invalid', async () => {
    syncMaterialSymbols.mockImplementationOnce(async (_icons: unknown, opts: any) => {
      opts.onLoaderMapGenerated?.('export const namedOnly = 1;');
      return { saved: 1, skipped: 0, failed: 0 };
    });

    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-invalid-loader-map-source-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);
    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any);

    const loaded = plugin.load?.('\u0000virtual:material-symbols-loader-map');
    expect(typeof loaded).toBe('string');
    expect(String(loaded)).toContain('export default');
  });

  it('serves loader map when importer has vite query suffix', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-virtual-importer-query-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);
    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any);

    const resolved = plugin.resolveId?.(
      './loader-map.js',
      '/var/www/frontend/node_modules/@hyrioo/vue-material-symbol/dist/consumer.js?v=f87030bb',
    );
    expect(resolved).toBe('\u0000virtual:material-symbols-loader-map');
  });

  it('rewrites dist consumer import to virtual loader map id', () => {
    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    const transformed = plugin.transform?.(
      "import RAW_MAP from './loader-map.js';\nexport default RAW_MAP;\n",
      '/repo/node_modules/@hyrioo/vue-material-symbol/dist/consumer.js',
    );

    expect(typeof transformed).toBe('string');
    expect(transformed).toContain("import RAW_MAP from 'virtual:material-symbols-loader-map';");
  });

  it('does not trigger sync when disabled', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-disabled-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs', enabled: false });
    plugin.configResolved?.({ root, command: 'build' } as any);

    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any);

    expect(syncMaterialSymbols).not.toHaveBeenCalled();
  });

  it('resyncs and invalidates virtual module when icons definition file changes and loader map changes', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-iconsdef-'));
    tempDirs.push(root);
    const iconsFile = path.join(root, 'icons.mjs');

    await fs.writeFile(
      iconsFile,
      "import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';\n" +
        "export default defineIcons({ home: { sizes: [24] } }, {}, { sizes: [24] });",
      'utf8',
    );

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'build' } as any);

    await plugin.buildStart?.call({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn((msg: string) => {
        throw new Error(msg);
      }),
      addWatchFile: vi.fn(),
    } as any);

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(1);

    let generation = 1;
    syncMaterialSymbols.mockImplementation(async (_icons: unknown, opts: any) => {
      opts.onLoaderMapGenerated?.(`export default {'g': ${generation++}};`);
      return { saved: 1, skipped: 0, failed: 0 };
    });

    const invalidateModule = vi.fn();
    const getModuleById = vi.fn((id: string) => (id.includes('virtual:material-symbols-loader-map') ? { id } : null));
    await fs.writeFile(
      iconsFile,
      "import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';\n" +
        "export default defineIcons({ folder: { sizes: [24] } }, {}, { sizes: [24] });",
      'utf8',
    );

    const res = await plugin.handleHotUpdate?.({
      file: iconsFile,
      server: {
        config: { logger: { info: vi.fn(), warn: vi.fn() } },
        moduleGraph: { getModuleById, invalidateModule },
        ws: { send: vi.fn() },
      },
    } as any);

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(2);
    expect(getModuleById).toHaveBeenCalled();
    expect(invalidateModule).toHaveBeenCalled();
    expect(res).toEqual([{ id: '\u0000virtual:material-symbols-loader-map' }]);
  });

  it('resyncs but does not reload when icons definition changes without loader map changes', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-iconsdef-no-reload-'));
    tempDirs.push(root);
    const iconsFile = path.join(root, 'icons.mjs');

    await fs.writeFile(
      iconsFile,
      "import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';\n" +
        "export default defineIcons({ home: { sizes: [24] } }, {}, { sizes: [24] });",
      'utf8',
    );

    syncMaterialSymbols.mockImplementation(async (_icons: unknown, opts: any) => {
      opts.onLoaderMapGenerated?.("export default {'stable': 1};");
      return { saved: 1, skipped: 0, failed: 0 };
    });

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs' });
    plugin.configResolved?.({ root, command: 'serve' } as any);

    await plugin.buildStart?.call({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn((msg: string) => {
        throw new Error(msg);
      }),
      addWatchFile: vi.fn(),
    } as any);

    const invalidateModule = vi.fn();
    const getModuleById = vi.fn();
    const res = await plugin.handleHotUpdate?.({
      file: iconsFile,
      server: {
        config: { logger: { info: vi.fn(), warn: vi.fn() } },
        moduleGraph: { getModuleById, invalidateModule },
        ws: { send: vi.fn() },
      },
    } as any);

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(2);
    expect(getModuleById).not.toHaveBeenCalled();
    expect(invalidateModule).not.toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('passes diagnostics option through to syncMaterialSymbols', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-plugin-diagnostics-'));
    tempDirs.push(root);
    await createIconsFile(root);

    const plugin = materialSymbolsSvg({ iconsFile: 'icons.mjs', diagnostics: 'off' });
    plugin.configResolved?.({ root, command: 'build' } as any);

    await plugin.buildStart?.call({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), addWatchFile: vi.fn() } as any);

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(1);
    const [, opts] = syncMaterialSymbols.mock.calls[0];
    expect(opts.diagnostics).toBe('off');
  });
});

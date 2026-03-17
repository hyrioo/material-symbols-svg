import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build } from 'vite';

const { syncMaterialSymbols } = vi.hoisted(() => ({
  syncMaterialSymbols: vi.fn(async (_icons: unknown, opts: any) => {
    opts.onLoaderMapGenerated?.(
      "export default {'rounded::home::0::400': {24: '<svg viewBox=\"0 0 24 24\"><path id=\"a\" /></svg>'}};",
    );
    return { saved: 1, skipped: 0, failed: 0 };
  }),
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
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
  syncMaterialSymbols.mockClear();
});

describe('virtual loader-map integration', () => {
  it('builds through Vite using virtual loader-map source', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mss-virtual-loader-'));
    tempDirs.push(root);

    const entry = path.join(root, 'entry.js');
    const iconsFile = path.join(root, 'icons.mjs');
    await fs.writeFile(
      entry,
      "import { getSymbol } from '@hyrioo/vue-material-symbol/consumer'; export default getSymbol({ icon: 'home', theme: 'rounded', filled: 0, weight: 400 });",
      'utf8',
    );
    await fs.writeFile(
      iconsFile,
      "import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';\n" +
        "export default defineIcons({ home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } }, {}, { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] });",
      'utf8',
    );

    const output = await build({
      root,
      logLevel: 'silent',
      resolve: {
        alias: {
          '@hyrioo/vue-material-symbol/consumer': path.resolve(
            process.cwd(),
            '../node_modules/@hyrioo/vue-material-symbol/dist/consumer.js',
          ),
        },
      },
      plugins: [
        materialSymbolsSvg({ iconsFile: 'icons.mjs' }),
      ],
      build: {
        write: false,
        minify: false,
        rollupOptions: {
          input: entry,
        },
      },
    });

    expect(syncMaterialSymbols).toHaveBeenCalledTimes(1);

    const codes = (Array.isArray(output) ? output : [output])
      .flatMap((o) => o.output)
      .filter((c): c is { type: 'chunk'; code: string } => c.type === 'chunk')
      .map((c) => c.code)
      .join('\n');

    expect(codes).toContain('rounded::home::0::400');
    expect(codes).toContain('<path id="a" />');
  });
});

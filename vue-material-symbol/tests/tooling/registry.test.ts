import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { defineIcons, generateConsumerFiles } from '../../src/tooling/registry';

describe('defineIcons', () => {
  it('returns symbols, custom and defaults', () => {
    const icons = defineIcons(
      { home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } },
      { spark: { 24: Promise.resolve({ default: '<svg viewBox="0 0 24 24"></svg>' }) } },
      { sizes: [24], themes: ['rounded'] },
    );

    expect(Object.keys(icons.Symbols)).toEqual(['home']);
    expect(Object.keys(icons.Custom || {})).toEqual(['spark']);
    expect(icons.Default?.sizes).toEqual([24]);
  });
});

describe('generateConsumerFiles', () => {
  it('escapes multiline custom svg strings in loader map source', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mss-registry-'));
    const iconTypesFile = path.join(tmp, 'icon-types.d.ts');
    const loaderMapFile = path.join(tmp, 'loader-map.js');
    const distDir = tmp;

    const iconsDef = defineIcons(
      {},
      {
        spark: {
          24: Promise.resolve({
            default:
              '<svg xmlns="http://www.w3.org/2000/svg">\n' +
              '  <path d="M0 0h24v24H0z" />\n' +
              '</svg>',
          }),
        },
      },
      {},
    );

    const { loaderMapContent } = await generateConsumerFiles(
      { warn: () => {} },
      iconsDef,
      iconTypesFile,
      loaderMapFile,
      distDir,
      { writeLoaderMap: false },
    );

    expect(loaderMapContent).toContain("export default {");
    expect(loaderMapContent).toContain("'custom::spark'");
    expect(loaderMapContent).toContain('\\n');
    expect(loaderMapContent).not.toContain('24: "\n<svg');
  });
});

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { writeArtifacts } from '../../src/tooling/core/artifacts';
import { buildSymbolVariantMatrix } from '../../src/tooling/core/matrix';
import { defineIcons } from '../../src/tooling/registry';

describe('writeArtifacts', () => {
  it('writes icon-types and parse-safe loader-map source', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mss-artifacts-'));
    const iconTypesFile = path.join(tmp, 'icon-types.d.ts');
    const loaderMapFile = path.join(tmp, 'loader-map.js');

    const icons = defineIcons(
      { home: { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] } },
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

    const matrix = buildSymbolVariantMatrix(icons, '/tmp/symbols');
    const { loaderMapSource } = await writeArtifacts(
      { info: () => {}, warn: () => {} },
      {
        matrix,
        custom: icons.Custom,
        materialSymbolIconUnion: "'home' | 'folder'",
      },
      { iconTypesFile, loaderMapFile },
    );

    const iconTypes = await fs.readFile(iconTypesFile, 'utf-8');
    expect(iconTypes).toContain("export type MaterialSymbolIcon = 'home' | 'folder';");
    expect(iconTypes).toContain("export type IconKey = 'home' | 'spark';");

    expect(loaderMapSource).toContain("export default {");
    expect(loaderMapSource).toContain("'custom::spark'");
    expect(loaderMapSource).toContain('\\n');
    expect(loaderMapSource).not.toContain('24: "\n<svg');
  });
});


import { describe, expect, it } from 'vitest';
import { buildSymbolVariantMatrix } from '../../src/tooling/core/matrix';
import { defineIcons } from '../../src/tooling/registry';

describe('buildSymbolVariantMatrix', () => {
  it('expands deterministic icon variants from defaults and overrides', () => {
    const icons = defineIcons(
      {
        home: { sizes: [24, 40], fills: [false, true], themes: ['rounded'] },
      },
      {},
      { weights: [400], themes: ['rounded'] },
    );

    const rows = buildSymbolVariantMatrix(icons, '/tmp/symbols');

    expect(rows).toHaveLength(4);
    expect(rows[0]?.key).toBe('rounded::home::0::400');
    expect(rows[0]?.relativeFile).toContain('rounded/home');
    expect(rows[3]?.key).toBe('rounded::home::1::400');
    expect(rows.map((r) => r.size)).toEqual([24, 40, 24, 40]);
  });
});


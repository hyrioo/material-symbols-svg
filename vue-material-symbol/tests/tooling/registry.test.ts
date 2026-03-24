import { describe, expect, it } from 'vitest';
import { defineIcons } from '../../src/tooling/registry';

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

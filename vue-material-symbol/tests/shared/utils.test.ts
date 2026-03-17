import { describe, expect, it } from 'vitest';
import { customKeyOf, keyOf, normalizeFills, normalizeNums, normalizeThemes, parseSvg } from '../../src/shared/utils';

describe('shared utils', () => {
  it('builds symbol keys', () => {
    expect(
      keyOf({ icon: 'home', theme: 'rounded', filled: 1, weight: 400 }),
    ).toBe('rounded::home::1::400');
    expect(customKeyOf({ icon: 'spark' })).toBe('custom::spark');
  });

  it('parses svg content and viewBox', () => {
    const parsed = parseSvg('<svg viewBox="0 0 24 24"><path id="a" /></svg>');

    expect(parsed).toEqual({
      viewBox: '0 0 24 24',
      content: '<path id="a" />',
    });
  });

  it('normalizes numeric, fill and theme lists', () => {
    expect(normalizeNums([24, '40', 'x'] as any, [20])).toEqual([24, 40]);
    expect(normalizeFills([0, 1, false, true], [0])).toEqual([0, 1]);
    expect(normalizeThemes(['rounded', 'sharp', 'bad'] as any, ['outlined'])).toEqual([
      'rounded',
      'sharp',
    ]);
  });
});

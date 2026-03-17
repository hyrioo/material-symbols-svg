import { describe, expect, it } from 'vitest';
import { axesString, buildSymbolUrl, toFilename } from '../../src/tooling/symbols';

describe('tooling symbols', () => {
  it('creates axes string', () => {
    expect(axesString(400, 0)).toBe('default');
    expect(axesString(700, 1)).toBe('wght700fill1');
  });

  it('creates deterministic filename', () => {
    expect(toFilename('home', 0, 400, 24)).toBe('home.w400.s24.svg');
    expect(toFilename('home', 1, 300, 40)).toBe('home-fill.w300.s40.svg');
  });

  it('creates google symbol url', () => {
    expect(buildSymbolUrl('rounded', 'home', 'default', 24)).toBe(
      'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/home/default/24px.svg',
    );
  });
});

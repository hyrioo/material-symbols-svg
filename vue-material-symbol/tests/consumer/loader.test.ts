import { beforeEach, describe, expect, it, vi } from 'vitest';

const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const { loaderMap } = vi.hoisted(() => ({
  loaderMap: {
    'rounded::home::0::400': {
      24: '<svg viewBox="0 0 24 24"><path id="a" /></svg>',
    },
    'custom::spark': {
      24: '<svg viewBox="0 0 24 24"><path id="b" /></svg>',
    },
  } as Record<string, Record<number, string>>,
}));

vi.mock('../../src/consumer/loader-map.js', () => ({
  default: loaderMap,
}));

describe('consumer loader', () => {
  beforeEach(() => {
    warnSpy.mockClear();
    vi.resetModules();
    Object.keys(loaderMap).forEach((k) => delete loaderMap[k]);
    loaderMap['rounded::home::0::400'] = { 24: '<svg viewBox="0 0 24 24"><path id="a" /></svg>' };
    loaderMap['custom::spark'] = { 24: '<svg viewBox="0 0 24 24"><path id="b" /></svg>' };
  });

  it('loads symbol from generated map', async () => {
    const { getSymbol } = await import('../../src/consumer/loader');
    const found = getSymbol({ icon: 'home', theme: 'rounded', filled: 0, weight: 400 });

    expect(found?.[24]).toEqual({
      viewBox: '0 0 24 24',
      content: '<path id="a" />',
    });
  });

  it('falls back to custom icon key', async () => {
    const { getSymbol } = await import('../../src/consumer/loader');
    const found = getSymbol({ icon: 'spark', theme: 'rounded', filled: 0, weight: 400 });

    expect(found?.[24].content).toContain('id="b"');
  });

  it('warns when symbol is missing', async () => {
    const { configureSymbolConfig } = await import('../../src/shared/config');
    const { getSymbol } = await import('../../src/consumer/loader');

    configureSymbolConfig({ diagnostics: 'always' });
    const found = getSymbol({ icon: 'missing', theme: 'rounded', filled: 0, weight: 400 });

    expect(found).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Icon "missing" was not found'));
  });

  it('warns about unsupported variant with fix hint', async () => {
    const { configureSymbolConfig } = await import('../../src/shared/config');
    const { getSymbol } = await import('../../src/consumer/loader');

    configureSymbolConfig({ diagnostics: 'always' });
    const found = getSymbol({ icon: 'home', theme: 'rounded', filled: 1, weight: 400 });

    expect(found).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Variant not found for icon "home"'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('include this variant in defineIcons()'));
  });

  it('can suppress diagnostics when mode is off', async () => {
    const { configureSymbolConfig } = await import('../../src/shared/config');
    const { getSymbol } = await import('../../src/consumer/loader');

    configureSymbolConfig({ diagnostics: 'off' });
    const found = getSymbol({ icon: 'missing', theme: 'rounded', filled: 0, weight: 400 });

    expect(found).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when loader map is empty with plugin wiring fix hint', async () => {
    const { configureSymbolConfig } = await import('../../src/shared/config');
    const { getSymbol } = await import('../../src/consumer/loader');

    Object.keys(loaderMap).forEach((k) => delete loaderMap[k]);
    configureSymbolConfig({ diagnostics: 'always' });
    const found = getSymbol({ icon: 'home', theme: 'rounded', filled: 0, weight: 400 });

    expect(found).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Loader map is empty'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('generate/populate @hyrioo/vue-material-symbol loader-map.js'));
  });
});

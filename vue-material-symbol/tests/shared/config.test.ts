import { describe, expect, it } from 'vitest';
import { configureSymbolConfig, shouldEmitDiagnostics, symbolConfig } from '../../src/shared/config';

describe('shared config', () => {
  it('updates diagnostics mode', () => {
    configureSymbolConfig({ diagnostics: 'off' });
    expect(symbolConfig.diagnostics).toBe('off');

    configureSymbolConfig({ diagnostics: 'always' });
    expect(symbolConfig.diagnostics).toBe('always');
  });

  it('resolves diagnostics mode by environment', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    expect(shouldEmitDiagnostics('dev')).toBe(true);
    expect(shouldEmitDiagnostics('always')).toBe(true);
    expect(shouldEmitDiagnostics('off')).toBe(false);

    process.env.NODE_ENV = 'production';
    expect(shouldEmitDiagnostics('dev')).toBe(false);
    expect(shouldEmitDiagnostics('always')).toBe(true);
    expect(shouldEmitDiagnostics('off')).toBe(false);
    process.env.NODE_ENV = prevNodeEnv;
  });
});

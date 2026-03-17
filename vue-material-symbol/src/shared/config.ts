export type DiagnosticsMode = 'dev' | 'always' | 'off';

export function shouldEmitDiagnostics(mode: DiagnosticsMode): boolean {
  if (mode === 'always') return true;
  if (mode === 'off') return false;

  if (typeof process !== 'undefined' && process.env && typeof process.env.NODE_ENV === 'string') {
    return process.env.NODE_ENV !== 'production';
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.MODE === 'string') {
    return import.meta.env.MODE !== 'production';
  }

  return false;
}

export interface SymbolConfig {
  diagnostics: DiagnosticsMode;
}

let _config: SymbolConfig = {
  diagnostics: 'dev',
};

export function configureSymbolConfig(overrides: Partial<SymbolConfig>) {
  _config = {
    ..._config,
    ...overrides,
  };
}

export const symbolConfig: SymbolConfig = {
  get diagnostics() {
    return _config.diagnostics;
  },
};

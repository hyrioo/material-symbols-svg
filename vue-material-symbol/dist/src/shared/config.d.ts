export type DiagnosticsMode = 'dev' | 'always' | 'off';
export declare function shouldEmitDiagnostics(mode: DiagnosticsMode): boolean;
export interface SymbolConfig {
    diagnostics: DiagnosticsMode;
}
export declare function configureSymbolConfig(overrides: Partial<SymbolConfig>): void;
export declare const symbolConfig: SymbolConfig;

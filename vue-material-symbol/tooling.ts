export { defineIcons, IconDefaultConfig, svg } from './src/tooling/registry';
export type {
  DefineCustomSource,
  DefineCustomMap,
  DefinedIcons,
  Filled,
  IconConfig,
  OpticalSize,
  SvgFileSource,
  SymbolKey,
  SymbolSvg,
  Theme,
  Weight,
} from './src/tooling/registry';

export { syncMaterialSymbols } from './src/tooling/sync';
export type { SyncMaterialSymbolsOptions } from './src/tooling/sync';

export { cleanupMaterialSymbolsCache } from './src/tooling/cleanup';
export type { CleanupMaterialSymbolsOptions } from './src/tooling/cleanup';

export { configureSymbolConfig, symbolConfig, shouldEmitDiagnostics } from './src/shared/config';
export type { DiagnosticsMode } from './src/shared/config';
export type { MaterialSymbolIcon } from './src/shared/icon-types';

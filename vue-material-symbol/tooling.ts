export { defineIcons, IconDefaultConfig } from './src/tooling/registry';
export type {
  DefineCustomSource,
  DefineCustomMap,
  DefinedIcons,
  Filled,
  IconConfig,
  OpticalSize,
  SymbolKey,
  SymbolSvg,
  Theme,
  Weight,
} from './src/tooling/registry';

export { syncMaterialSymbols, syncMaterialSymbolsInternal } from './src/tooling/sync';
export type {
  SyncMaterialSymbolsOptions,
  SyncMaterialSymbolsInternalOptions,
  SyncMaterialSymbolsInternalResult,
} from './src/tooling/sync';

export { cleanupMaterialSymbolsCache } from './src/tooling/cleanup';
export type { CleanupMaterialSymbolsOptions, CleanupMaterialSymbolsResult } from './src/tooling/cleanup';

export { configureSymbolConfig, symbolConfig, shouldEmitDiagnostics } from './src/shared/config';
export type { DiagnosticsMode } from './src/shared/config';
export type { IconKey, MaterialSymbolIcon } from './src/shared/icon-types';

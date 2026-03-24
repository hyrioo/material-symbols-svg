import type { DefinedIcons } from './registry';
import { type DiagnosticsMode } from '../shared/config';
import { type ToolingLogger } from './core/fs-download';
export interface SyncMaterialSymbolsOptions {
    rootDir?: string;
    concurrency?: number;
    strict?: boolean;
    diagnostics?: DiagnosticsMode;
}
export interface SyncMaterialSymbolsInternalOptions extends SyncMaterialSymbolsOptions {
    logger?: ToolingLogger;
}
export interface SyncMaterialSymbolsInternalResult {
    saved: number;
    skipped: number;
    failed: number;
    loaderMapSource: string;
}
export declare function syncMaterialSymbolsInternal(iconsDef: DefinedIcons, opts?: SyncMaterialSymbolsInternalOptions): Promise<SyncMaterialSymbolsInternalResult>;
export declare function syncMaterialSymbols(iconsDef: DefinedIcons, opts?: SyncMaterialSymbolsOptions): Promise<{
    saved: number;
    skipped: number;
    failed: number;
}>;

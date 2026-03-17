import { type ToolingLogger } from './meta';
import { type DefinedIcons } from './registry';
import { type DiagnosticsMode } from '../shared/config';
export interface SyncMaterialSymbolsOptions {
    rootDir?: string;
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    diagnostics?: DiagnosticsMode;
    logger?: ToolingLogger;
    virtualLoaderMap?: boolean;
    onLoaderMapGenerated?: (source: string) => void;
}
export declare function syncMaterialSymbols(iconsDef: DefinedIcons, opts?: SyncMaterialSymbolsOptions): Promise<{
    saved: number;
    skipped: number;
    failed: number;
}>;

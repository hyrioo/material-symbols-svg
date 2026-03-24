import type { DefinedIcons } from './registry';
import { type ToolingLogger } from './core/fs-download';
export interface CleanupMaterialSymbolsOptions {
    rootDir?: string;
    logger?: ToolingLogger;
    clearAll?: boolean;
}
export interface CleanupMaterialSymbolsResult {
    removedFiles: number;
    keptFiles: number;
    scannedFiles: number;
    symbolsPath: string;
}
export declare function cleanupMaterialSymbolsCache(iconsDef: DefinedIcons, opts?: CleanupMaterialSymbolsOptions): Promise<CleanupMaterialSymbolsResult>;

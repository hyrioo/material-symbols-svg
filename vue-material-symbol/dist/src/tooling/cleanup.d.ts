import { type ToolingLogger } from './meta';
import { type DefinedIcons } from './registry';
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

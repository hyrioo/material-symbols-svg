import { type Theme } from '../../shared/types';
import type { SymbolVariantEntry } from './matrix';
export interface ToolingLogger {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error?: (msg: string) => never | void;
}
export declare const GENERATED_BANNER: string;
export declare function exists(p: string): Promise<boolean>;
export declare function ensureDir(dir: string): Promise<void>;
export declare function writeIfChanged(file: string, content: string): Promise<boolean>;
export declare function defaultLogger(): ToolingLogger;
export interface ToolingPaths {
    rootDir: string;
    tempDir: string;
    symbolsDir: string;
    distDir: string;
    iconTypesFile: string;
    loaderMapFile: string;
}
export declare function resolveToolingPaths(rootDir: string): ToolingPaths;
export declare function axesString(weight: number, filled: 0 | 1): string;
export declare function buildSymbolUrl(theme: Theme, icon: string, axes: string, size: number): string;
export declare function toFilename(icon: string, filled: 0 | 1, weight: number, size: number): string;
export declare function withConcurrency<T, R>(items: T[], limit: number, worker: (item: T, i: number) => Promise<R>): Promise<R[]>;
export declare function downloadSymbols(tasks: {
    url: string;
    file: string;
}[], concurrency: number, options?: {
    onProgress?: (progress: {
        completed: number;
        total: number;
        saved: number;
        failed: number;
    }) => void;
}): Promise<{
    saved: number;
    skipped: number;
    failed: number;
    toDownload: number;
    failures: string[];
}>;
export interface DownloadMatrixOptions {
    concurrency: number;
    logger: ToolingLogger;
}
export declare function downloadFromMatrix(matrix: SymbolVariantEntry[], opts: DownloadMatrixOptions): Promise<{
    saved: number;
    skipped: number;
    failed: number;
    failures: string[];
}>;

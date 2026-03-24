import type { ToolingLogger } from './fs-download';
export interface MetadataOptions {
    strict?: boolean;
}
export interface MetadataResult {
    unionType: string;
    versions: Record<string, string | number>;
}
export declare function resolveMaterialSymbolMetadata(logger: ToolingLogger, versionsFile: string, options: MetadataOptions): Promise<MetadataResult>;

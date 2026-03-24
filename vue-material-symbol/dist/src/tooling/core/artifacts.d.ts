import type { DefineCustomMap } from '../../shared/types';
import type { ToolingLogger } from './fs-download';
import type { SymbolVariantEntry } from './matrix';
export interface ArtifactBuildInput {
    matrix: SymbolVariantEntry[];
    custom: DefineCustomMap | undefined;
    materialSymbolIconUnion: string;
}
export interface ArtifactWriteOutput {
    loaderMapSource: string;
}
export declare function buildIconTypesSource(materialSymbolIconUnion: string, iconKeyUnion: string): string;
export declare function writeArtifacts(logger: ToolingLogger, input: ArtifactBuildInput, files: {
    iconTypesFile: string;
    loaderMapFile: string;
}): Promise<ArtifactWriteOutput>;

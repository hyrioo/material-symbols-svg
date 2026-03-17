import { type DefineCustomMap, type DefineCustomSource, type DefinedIcons, type Filled, type IconConfig, type OpticalSize, type SvgFileSource, type SymbolKey, type SymbolSvg, type Theme, type Weight } from '../shared/types';
import type { MaterialSymbolIcon } from '../shared/icon-types';
export type { OpticalSize, Weight, Filled, Theme, SymbolKey, SymbolSvg, IconConfig, DefinedIcons, DefineCustomMap, DefineCustomSource, SvgFileSource, };
export declare function defineIcons<S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>, C extends DefineCustomMap = {}, D extends Partial<IconConfig> = {}>(symbols: S, custom: C, defaults: D): DefinedIcons;
export declare const IconDefaultConfig: {
    sizes: readonly [20, 24, 40, 48];
    weights: readonly [400];
    fills: readonly [0];
    themes: readonly ["rounded"];
};
export declare function svg(filePath: string): SvgFileSource;
export declare function generateConsumerFiles(logger: {
    warn: (msg: string) => void;
}, iconsDef: DefinedIcons, iconTypesFile: string, loaderMapFile: string, distDir: string, options?: {
    writeLoaderMap?: boolean;
}): Promise<{
    loaderMapContent: string;
}>;

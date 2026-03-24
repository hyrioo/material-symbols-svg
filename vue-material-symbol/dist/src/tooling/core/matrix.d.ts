import { type Theme } from '../../shared/types';
import type { DefinedIcons } from '../registry';
export declare const IconDefaultConfig: {
    sizes: readonly [20, 24, 40, 48];
    weights: readonly [400];
    fills: readonly [0];
    themes: readonly ["rounded"];
};
export interface SymbolVariantEntry {
    icon: string;
    theme: Theme;
    weight: number;
    filled: 0 | 1;
    size: number;
    key: string;
    relativeFile: string;
    absoluteFile: string;
    importPath: string;
    url: string;
}
export declare function buildSymbolVariantMatrix(iconsDef: DefinedIcons, symbolsBaseDir: string): SymbolVariantEntry[];

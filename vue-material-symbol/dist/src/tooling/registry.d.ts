import { type DefineCustomMap, type DefineCustomSource, type DefinedIcons, type Filled, type IconConfig, type OpticalSize, type SymbolKey, type SymbolSvg, type Theme, type Weight } from '../shared/types';
import type { MaterialSymbolIcon } from '../shared/icon-types';
import { IconDefaultConfig } from './core/matrix';
export type { OpticalSize, Weight, Filled, Theme, SymbolKey, SymbolSvg, IconConfig, DefinedIcons, DefineCustomMap, DefineCustomSource, };
export { IconDefaultConfig };
export declare function defineIcons<S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>, C extends DefineCustomMap = {}, D extends Partial<IconConfig> = {}>(symbols: S, custom: C, defaults: D): DefinedIcons;

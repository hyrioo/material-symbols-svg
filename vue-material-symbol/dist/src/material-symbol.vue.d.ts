import type { Filled, OpticalSize, Theme, Weight } from './shared/types';
import type { IconKey } from './shared/icon-types';
import type { SvgColor, ColorProp } from './index';
export type { SvgColor, ColorProp };
export interface MaterialSymbolProps {
    icon: IconKey;
    weight?: Weight;
    theme?: Theme;
    filled?: Filled;
    fills?: ColorProp;
    strokes?: ColorProp;
    size?: number | {
        width: number;
        height: number;
    };
    opticalSize?: OpticalSize | null;
}
declare const _default: import("vue").DefineComponent<MaterialSymbolProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<MaterialSymbolProps> & Readonly<{}>, {
    theme: Theme;
    filled: Filled;
    weight: Weight;
    fills: ColorProp;
    strokes: ColorProp;
    size: number | {
        width: number;
        height: number;
    };
    opticalSize: OpticalSize | null;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;

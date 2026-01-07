import type { Filled, IconKey, OpticalSize, Theme, Weight } from '@hyrioo/vite-plugin-material-symbols-svg/consumer';
export type SvgColor = string | 'current' | 'keep' | null;
export interface MaterialSymbolProps {
    icon: IconKey;
    weight?: Weight;
    theme?: Theme;
    filled?: Filled;
    fills?: SvgColor | SvgColor[] | {
        [key: string]: SvgColor;
    };
    strokes?: SvgColor | SvgColor[] | {
        [key: string]: SvgColor;
    };
    size?: number | {
        width: number;
        height: number;
    };
    opticalSize?: OpticalSize | null;
}
declare const _default: import("vue").DefineComponent<MaterialSymbolProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<MaterialSymbolProps> & Readonly<{}>, {
    weight: Weight;
    theme: Theme;
    filled: Filled;
    fills: SvgColor | SvgColor[] | {
        [key: string]: SvgColor;
    };
    strokes: SvgColor | SvgColor[] | {
        [key: string]: SvgColor;
    };
    size: number | {
        width: number;
        height: number;
    };
    opticalSize: OpticalSize | null;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;

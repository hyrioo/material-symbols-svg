import type { Filled, Theme, Weight } from '@hyrioo/vite-plugin-material-symbols-svg/consumer';
export { default as MaterialSymbol } from './material-symbol.vue';
export type { MaterialSymbolProps } from './material-symbol.vue';
export type SvgColor = string | 'text' | 'keep' | null;
export type ColorProp = SvgColor | SvgColor[] | {
    [key: string]: SvgColor;
};
export interface MaterialSymbolDefaultProps {
    weight: Weight;
    theme: Theme;
    filled: Filled;
    fills: ColorProp;
    strokes: ColorProp;
    debug: boolean;
    colorSchemes: Record<string, ColorProp>;
}
export declare function configureMaterialSymbolDefaultProps(overrides: Partial<MaterialSymbolDefaultProps>): void;
export declare const materialSymbolDefaultProps: {
    readonly weight: Weight;
    readonly theme: Theme;
    readonly filled: boolean;
    readonly fills: SvgColor | {
        readonly [x: string]: SvgColor;
    } | readonly SvgColor[];
    readonly strokes: SvgColor | {
        readonly [x: string]: SvgColor;
    } | readonly SvgColor[];
    readonly debug: boolean;
    readonly colorSchemes: {
        readonly [x: string]: SvgColor | {
            readonly [x: string]: SvgColor;
        } | readonly SvgColor[];
    };
};

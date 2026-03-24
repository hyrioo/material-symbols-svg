import type { Filled, Theme, Weight } from './shared/types';
export { default as MaterialSymbol } from './material-symbol.vue';
export type { MaterialSymbolProps } from './material-symbol.vue';
export type { IconKey, MaterialSymbolIcon } from './shared/icon-types';
export type SvgColor = string | 'text' | 'keep' | null;
export type ColorProp = SvgColor | readonly SvgColor[] | Readonly<Record<string, SvgColor>>;
export interface MaterialSymbolDefaultProps {
    weight: Weight;
    theme: Theme;
    filled: Filled;
    fills: ColorProp;
    strokes: ColorProp;
    colorSchemes: Record<string, ColorProp>;
}
export declare function configureMaterialSymbolDefaultProps(overrides: Partial<MaterialSymbolDefaultProps>): void;
export declare const materialSymbolDefaultProps: {
    readonly weight: Weight;
    readonly theme: Theme;
    readonly filled: boolean;
    readonly fills: SvgColor | readonly SvgColor[] | {
        readonly [x: string]: SvgColor;
    };
    readonly strokes: SvgColor | readonly SvgColor[] | {
        readonly [x: string]: SvgColor;
    };
    readonly colorSchemes: {
        readonly [x: string]: SvgColor | readonly SvgColor[] | {
            readonly [x: string]: SvgColor;
        };
    };
};

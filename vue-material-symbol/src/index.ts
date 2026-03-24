import { readonly } from 'vue';
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

let _defaults: MaterialSymbolDefaultProps = {
  weight: 400,
  theme: 'rounded',
  filled: false,
  fills: 'text',
  strokes: null,
  colorSchemes: {},
};

export function configureMaterialSymbolDefaultProps(overrides: Partial<MaterialSymbolDefaultProps>) {
  _defaults = {
    ..._defaults,
    ...overrides,
  };
}

export const materialSymbolDefaultProps = readonly({
  get weight() {
    return _defaults.weight;
  },
  get theme() {
    return _defaults.theme;
  },
  get filled() {
    return _defaults.filled;
  },
  get fills() {
    return _defaults.fills;
  },
  get strokes() {
    return _defaults.strokes;
  },
  get colorSchemes() {
    return _defaults.colorSchemes;
  },
});

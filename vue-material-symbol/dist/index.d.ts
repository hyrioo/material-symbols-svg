import type { Filled, Theme, Weight } from '@hyrioo/vite-plugin-material-symbols-svg/consumer';
export { default as MaterialSymbol } from './material-symbol.vue';
export type { MaterialSymbolProps } from './material-symbol.vue';
export interface MaterialSymbolDefaultProps {
    weight: Weight;
    theme: Theme;
    filled: Filled;
    debug: boolean;
}
export declare function configureSymbolDefaultProps(overrides: Partial<MaterialSymbolDefaultProps>): void;
export declare const symbolDefaultProps: {
    readonly weight: Weight;
    readonly theme: Theme;
    readonly filled: boolean;
    readonly debug: boolean;
};

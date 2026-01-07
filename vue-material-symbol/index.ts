import { readonly } from 'vue';
import type { Filled, Theme, Weight } from '@hyrioo/vite-plugin-material-symbols-svg/consumer';
import { isProduction } from '@hyrioo/vite-plugin-material-symbols-svg';

export { default as MaterialSymbol } from './material-symbol.vue';
export type { MaterialSymbolProps } from './material-symbol.vue';

export interface MaterialSymbolDefaultProps {
    weight: Weight;
    theme: Theme;
    filled: Filled;
    debug: boolean;
}

let _defaults: MaterialSymbolDefaultProps = {
    weight: 400,
    theme: 'rounded',
    filled: false,
    debug: isProduction,
};

export function configureSymbolDefaultProps(
    overrides: Partial<MaterialSymbolDefaultProps>,
) {
    _defaults = {
        ..._defaults,
        ...overrides,
    };
}

export const symbolDefaultProps = readonly({
    get weight() {
        return _defaults.weight;
    },
    get theme() {
        return _defaults.theme;
    },
    get filled() {
        return _defaults.filled;
    },
    get debug() {
        return _defaults.debug;
    },
});
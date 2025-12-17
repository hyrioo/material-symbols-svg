// Vue package entry: exports the component and shared types/helpers
export { default as CIcon } from './c-icon.vue';

// Shared types and helpers (moved from former source/index.ts)
export type OpticalSize = 20 | 24 | 40 | 48;
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type Fill = boolean;
export type Theme = 'rounded' | 'outlined' | 'sharp';

export type IconConfig = {
  sizes: readonly OpticalSize[];
  weights?: readonly Weight[];
  fills?: readonly Fill[];
  themes?: readonly Theme[];
};

export const DefaultConfig: IconConfig = {
  sizes: [20, 24, 40, 48],
  weights: [400],
  fills: [false],
  themes: ['rounded'],
} as const;

export const icon = (config: Partial<IconConfig> = {}) => ({
  ...DefaultConfig,
  ...config,
}) as IconConfig;

export interface SymbolSvg {
  d: string;
  viewBox: string;
}

export interface SymbolKey {
  icon: string;
  theme: Theme;
  fill: 0 | 1;
  weight: number;
  size: number; // optical size in px
}

// defineIcons helper to create strongly typed maps
// A map of custom icons where each icon may specify any subset of optical sizes
// Example: { spark: { 24: svg24 }, brand: { 20: svg20, 40: svg40 } }
export type DefineCustomMap = Record<string, Partial<Readonly<Record<OpticalSize, unknown>>>>;
export function defineIcons<
  S extends Record<string, Partial<IconConfig>>,
  C extends DefineCustomMap = Record<never, never>
>(symbols: S, custom?: C) {
  return {
    Symbols: symbols,
    Custom: (custom ?? ({} as C)),
  } as const;
}

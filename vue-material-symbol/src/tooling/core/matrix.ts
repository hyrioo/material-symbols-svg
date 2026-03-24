import { type Theme } from '../../shared/types';
import { normalizeFills, normalizeNums, normalizeThemes, unique } from '../../shared/utils';
import { axesString, buildSymbolUrl, toFilename } from './fs-download';
import type { DefinedIcons, IconConfig } from '../registry';

export const IconDefaultConfig = {
  sizes: [20, 24, 40, 48] as const,
  weights: [400] as const,
  fills: [0] as const,
  themes: ['rounded'] as const,
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

const SYMBOLS_ROOT_PATH = '/node_modules/@hyrioo/vue-material-symbol/.temp/symbols';

function variantKey(theme: Theme, icon: string, filled: 0 | 1, weight: number): string {
  return `${theme}::${icon}::${filled}::${weight}`;
}

export function buildSymbolVariantMatrix(
  iconsDef: DefinedIcons,
  symbolsBaseDir: string,
): SymbolVariantEntry[] {
  const rows: SymbolVariantEntry[] = [];
  const defaults: Partial<IconConfig> = iconsDef.Default ?? {};
  const iconsMap = iconsDef.Symbols ?? {};

  for (const [icon, meta] of Object.entries(iconsMap)) {
    const sizes = normalizeNums(meta.sizes ?? defaults.sizes, IconDefaultConfig.sizes);
    const weights = normalizeNums(meta.weights ?? defaults.weights, IconDefaultConfig.weights);
    const fills = normalizeFills(meta.fills ?? defaults.fills, IconDefaultConfig.fills);
    const themes = normalizeThemes(meta.themes ?? defaults.themes, IconDefaultConfig.themes);

    for (const theme of unique(themes)) {
      for (const weight of unique(weights)) {
        for (const filled of unique(fills)) {
          const key = variantKey(theme, icon, filled as 0 | 1, weight);
          for (const size of unique(sizes)) {
            const filename = toFilename(icon, filled as 0 | 1, weight, size);
            rows.push({
              icon,
              theme,
              weight,
              filled: filled as 0 | 1,
              size,
              key,
              relativeFile: `${theme}/${filename}`,
              absoluteFile: `${symbolsBaseDir}/${theme}/${filename}`,
              importPath: `${SYMBOLS_ROOT_PATH}/${theme}/${filename}?raw`,
              url: buildSymbolUrl(theme as Theme, icon, axesString(weight, filled as 0 | 1), size),
            });
          }
        }
      }
    }
  }

  return rows;
}

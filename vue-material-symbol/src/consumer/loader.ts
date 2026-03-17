import {
  type DefineCustomMap,
  type DefinedIcons,
  type Filled,
  type IconConfig,
  type OpticalSize,
  type SymbolKey,
  type SymbolSvg,
  type Theme,
  type Weight,
} from '../shared/types';
import { customKeyOf, keyOf, parseSvg } from '../shared/utils';
import { shouldEmitDiagnostics, symbolConfig } from '../shared/config';
import RAW_MAP from './loader-map.js';

const REGISTRY = new Map<string, Record<number, SymbolSvg>>();
const DIAGNOSTIC_WARNED = new Set<string>();
const LOADER_MAP = RAW_MAP as Record<string, Record<string, string>>;

export type {
  OpticalSize,
  Weight,
  Filled,
  Theme,
  IconConfig,
  DefinedIcons,
  SymbolKey,
  SymbolSvg,
  DefineCustomMap,
};

function warnDiagnosticOnce(key: string, message: string): void {
  if (!shouldEmitDiagnostics(symbolConfig.diagnostics) || DIAGNOSTIC_WARNED.has(key)) return;
  DIAGNOSTIC_WARNED.add(key);
  console.warn(`[vue-material-symbol] ${message}`);
}

function hasAnyVariantForIcon(icon: string): boolean {
  const marker = `::${icon}::`;
  return Object.keys(LOADER_MAP).some((k) => k.includes(marker));
}

export function getSymbol(k: SymbolKey): Record<number, SymbolSvg> | undefined {
  const key = keyOf(k);
  const cKey = customKeyOf(k);

  let available = REGISTRY.get(key) || REGISTRY.get(cKey);

  if (!available) {
    const rawGroup = LOADER_MAP[key] || LOADER_MAP[cKey];
    if (rawGroup) {
      available = {};
      for (const [s, svg] of Object.entries(rawGroup)) {
        const parsed = parseSvg(svg);
        if (parsed) {
          available[Number(s)] = parsed;
        }
      }
      REGISTRY.set(rawGroup === LOADER_MAP[key] ? key : cKey, available);
    } else {
      const mapKeys = Object.keys(LOADER_MAP);
      if (mapKeys.length === 0) {
        warnDiagnosticOnce(
          'loader-map-empty',
          'Loader map is empty. Fix: generate/populate @hyrioo/vue-material-symbol loader-map.js before rendering icons.',
        );
      } else if (hasAnyVariantForIcon(k.icon)) {
        warnDiagnosticOnce(
          `variant:${key}`,
          `Variant not found for icon "${k.icon}" (theme=${k.theme}, filled=${k.filled}, weight=${k.weight}). Fix: include this variant in defineIcons() or use an available one.`,
        );
      } else {
        warnDiagnosticOnce(
          `icon:${k.icon}`,
          `Icon "${k.icon}" was not found in generated symbols. Fix: add it to defineIcons().`,
        );
      }
    }
  }

  return available as Record<number, SymbolSvg> | undefined;
}

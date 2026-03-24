import { customKeyOf } from '../../shared/utils';
import type { DefineCustomMap } from '../../shared/types';
import type { ToolingLogger } from './fs-download';
import type { SymbolVariantEntry } from './matrix';
import { GENERATED_BANNER, writeIfChanged } from './fs-download';

function toJsStringLiteral(value: string): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export interface ArtifactBuildInput {
  matrix: SymbolVariantEntry[];
  custom: DefineCustomMap | undefined;
  materialSymbolIconUnion: string;
}

export interface ArtifactWriteOutput {
  loaderMapSource: string;
}

export function buildIconTypesSource(materialSymbolIconUnion: string, iconKeyUnion: string): string {
  return (
    GENERATED_BANNER +
    `export type MaterialSymbolIcon = ${materialSymbolIconUnion};\n` +
    `export type IconKey = ${iconKeyUnion};\n`
  );
}

function buildMatrixMap(
  matrix: SymbolVariantEntry[],
): {
  imports: string[];
  entries: string[];
  nextIndex: number;
} {
  const imports: string[] = [];
  const grouped = new Map<string, string[]>();
  let i = 0;

  for (const row of matrix) {
    const varName = `i${i++}`;
    imports.push(`import ${varName} from '${row.importPath}';`);
    const group = grouped.get(row.key) ?? [];
    group.push(`      ${row.size}: ${varName}`);
    grouped.set(row.key, group);
  }

  const entries = Array.from(grouped.entries()).map(([key, lines]) => `  '${key}': {\n${lines.join(',\n')}\n  },`);
  return { imports, entries, nextIndex: i };
}

async function buildCustomMap(custom: DefineCustomMap | undefined, startIndex: number): Promise<{ imports: string[]; entries: string[] }> {
  const imports: string[] = [];
  const entries: string[] = [];
  let i = startIndex;

  for (const [icon, sizesObj] of Object.entries(custom || {})) {
    const key = customKeyOf({ icon } as any);
    const lines: string[] = [];

    for (const [sizeKey, valueRaw] of Object.entries((sizesObj as any) || {})) {
      let value = valueRaw;
      if (value && typeof value === 'object' && 'then' in value && typeof (value as any).then === 'function') {
        value = await value;
      }

      if (typeof value === 'string' && (value.startsWith('./') || value.startsWith('../'))) {
        const varName = `i${i++}`;
        imports.push(`import ${varName} from '${value}?raw';`);
        lines.push(`      ${sizeKey}: ${varName}`);
        continue;
      }

      if (!value) continue;
      const content = typeof value === 'object' && 'default' in value ? (value as any).default : value;
      if (typeof content === 'string') {
        lines.push(`      ${sizeKey}: ${toJsStringLiteral(content)}`);
      }
    }

    if (lines.length > 0) {
      entries.push(`  '${key}': {\n${lines.join(',\n')}\n  },`);
    }
  }

  return { imports, entries };
}

export async function writeArtifacts(
  logger: ToolingLogger,
  input: ArtifactBuildInput,
  files: { iconTypesFile: string; loaderMapFile: string },
): Promise<ArtifactWriteOutput> {
  const symbolKeys = new Set(input.matrix.map((row) => row.icon));
  const customKeys = Object.keys(input.custom || {});
  const iconKeyNames = Array.from(new Set([...symbolKeys, ...customKeys]));
  const iconKeyUnion = iconKeyNames.length ? iconKeyNames.map((n) => `'${n.replace(/'/g, "\\'")}'`).join(' | ') : 'string';

  const iconTypes = buildIconTypesSource(input.materialSymbolIconUnion, iconKeyUnion);
  try {
    await writeIfChanged(files.iconTypesFile, iconTypes);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.warn(`[vue-material-symbol] Failed to write icon-types.d.ts: ${msg}`);
  }

  const matrixPart = buildMatrixMap(input.matrix);
  const customPart = await buildCustomMap(input.custom, matrixPart.nextIndex);
  const loaderMapSource =
    `${GENERATED_BANNER}${[...matrixPart.imports, ...customPart.imports].join('\n')}\n\n` +
    `export default {\n${[...matrixPart.entries, ...customPart.entries].join('\n')}\n};\n`;

  try {
    await writeIfChanged(files.loaderMapFile, loaderMapSource);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.warn(`[vue-material-symbol] Failed to write loader-map.js: ${msg}`);
  }

  return { loaderMapSource };
}

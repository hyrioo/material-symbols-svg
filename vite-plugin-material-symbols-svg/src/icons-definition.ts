import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import { build } from 'esbuild';
import type { DefinedIcons } from '@hyrioo/vue-material-symbol/tooling';

interface SvgFileSource {
  __hyriooSvgFile: string;
}

function isSvgFileSource(value: unknown): value is SvgFileSource {
  return Boolean(value && typeof value === 'object' && '__hyriooSvgFile' in value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function resolveWatchCandidate(projectRoot: string, iconsDir: string, sourcePath: string): string {
  if (path.isAbsolute(sourcePath)) return path.resolve(sourcePath);
  return sourcePath.startsWith('.') ? path.resolve(iconsDir, sourcePath) : path.resolve(projectRoot, sourcePath);
}

function collectWatchFiles(projectRoot: string, absIconsFile: string, iconsDef: DefinedIcons): Set<string> {
  const files = new Set<string>([path.resolve(absIconsFile)]);
  const iconsDir = path.dirname(absIconsFile);
  const custom = asRecord(iconsDef.Custom);
  if (!custom) return files;

  for (const sizeMap of Object.values(custom)) {
    const sizeRecord = asRecord(sizeMap);
    if (!sizeRecord) continue;

    for (const source of Object.values(sizeRecord)) {
      if (typeof source === 'string' && (source.startsWith('./') || source.startsWith('../'))) {
        files.add(resolveWatchCandidate(projectRoot, iconsDir, source));
      } else if (isSvgFileSource(source)) {
        files.add(resolveWatchCandidate(projectRoot, iconsDir, source.__hyriooSvgFile));
      }
    }
  }

  return files;
}

async function importBundledModule(projectRoot: string, absIconsFile: string): Promise<unknown> {
  const bundle = await build({
    entryPoints: [absIconsFile],
    absWorkingDir: projectRoot,
    platform: 'node',
    format: 'esm',
    bundle: true,
    write: false,
    target: 'node18',
    loader: {
      '.svg': 'text',
    },
    external: ['@hyrioo/vue-material-symbol', '@hyrioo/vue-material-symbol/*'],
  });

  const bundled = bundle.outputFiles?.[0]?.text;
  if (!bundled) {
    throw new Error('iconsFile bundling produced no output');
  }

  const tmpBase = path.resolve(projectRoot, 'node_modules', '.cache', 'material-symbols-svg');
  await fs.mkdir(tmpBase, { recursive: true });
  const tmpDir = await fs.mkdtemp(path.join(tmpBase, 'icons-'));
  const tmpFile = path.join(tmpDir, 'icons.bundle.mjs');
  await fs.writeFile(tmpFile, bundled, 'utf8');

  try {
    const href = `${pathToFileURL(tmpFile).href}?t=${Date.now()}`;
    return await import(href);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

export async function loadIconsDefinition(root: string, iconsFile: string): Promise<{
  abs: string;
  iconsDef: DefinedIcons;
  watchedFiles: Set<string>;
}> {
  const projectRoot = root || process.cwd();
  const abs = path.resolve(projectRoot, iconsFile);

  try {
    const mod = await importBundledModule(projectRoot, abs);
    const iconsDef = (mod as Record<string, unknown> | null)?.default as DefinedIcons | undefined;

    if (!iconsDef || !iconsDef.Symbols) {
      throw new Error(
        `[material-symbols-svg] iconsFile must default export defineIcons(...). Fix: update ${iconsFile} to \`export default defineIcons(...)\`.`,
      );
    }

    return {
      abs,
      iconsDef,
      watchedFiles: collectWatchFiles(projectRoot, abs, iconsDef),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const maybeSvgImportIssue =
      detail.includes('Unknown file extension ".svg"') || detail.includes('ERR_UNKNOWN_FILE_EXTENSION');
    const hint = maybeSvgImportIssue
      ? " Fix: use `svg('./path/icon.svg')` from @hyrioo/vue-material-symbol/tooling (or keep .ts wrappers)."
      : '';
    throw new Error(`[material-symbols-svg] Failed to evaluate iconsFile with SVG support.${hint} Details: ${detail}`);
  }
}

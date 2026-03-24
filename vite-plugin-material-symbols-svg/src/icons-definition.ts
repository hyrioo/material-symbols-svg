import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import { build } from 'esbuild';
import type { DefinedIcons } from '@hyrioo/vue-material-symbol/tooling';

async function importBundledModule(
  projectRoot: string,
  absIconsFile: string,
): Promise<{ mod: unknown; watchedFiles: Set<string> }> {
  const bundle = await build({
    entryPoints: [absIconsFile],
    absWorkingDir: projectRoot,
    platform: 'node',
    format: 'esm',
    bundle: true,
    write: false,
    metafile: true,
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

  const watchedFiles = new Set<string>();
  for (const input of Object.keys(bundle.metafile?.inputs ?? {})) {
    const absInput = path.resolve(projectRoot, input);
    const normalized = absInput.replace(/\\/g, '/');
    if (!normalized.startsWith(projectRoot.replace(/\\/g, '/'))) continue;
    if (normalized.includes('/node_modules/')) continue;
    watchedFiles.add(absInput);
  }
  watchedFiles.add(path.resolve(absIconsFile));

  const tmpBase = path.resolve(projectRoot, 'node_modules', '.cache', 'material-symbols-svg');
  await fs.mkdir(tmpBase, { recursive: true });
  const tmpDir = await fs.mkdtemp(path.join(tmpBase, 'icons-'));
  const tmpFile = path.join(tmpDir, 'icons.bundle.mjs');
  await fs.writeFile(tmpFile, bundled, 'utf8');

  try {
    const href = `${pathToFileURL(tmpFile).href}?t=${Date.now()}`;
    const mod = await import(href);
    return { mod, watchedFiles };
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
    const { mod, watchedFiles } = await importBundledModule(projectRoot, abs);
    const iconsDef = (mod as Record<string, unknown> | null)?.default as DefinedIcons | undefined;

    if (!iconsDef || !iconsDef.Symbols) {
      throw new Error(
        `[material-symbols-svg] iconsFile must default export defineIcons(...). Fix: update ${iconsFile} to \`export default defineIcons(...)\`.`,
      );
    }

    return {
      abs,
      iconsDef,
      watchedFiles,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const missingToolingSubpath =
      detail.includes(`Package subpath './tooling' is not defined by "exports"`) ||
      detail.includes(`Package subpath './tooling' is not defined by 'exports'`);
    const maybeSvgImportIssue =
      detail.includes('Unknown file extension ".svg"') || detail.includes('ERR_UNKNOWN_FILE_EXTENSION');
    const hint = missingToolingSubpath
      ? ' Fix: reinstall/update @hyrioo/vue-material-symbol so it exports `./tooling`.'
      : maybeSvgImportIssue
        ? " Fix: import SVGs from iconsFile with `import('./path/icon.svg')`, or use .ts wrappers."
        : '';
    throw new Error(`[material-symbols-svg] Failed to evaluate iconsFile with SVG support.${hint} Details: ${detail}`);
  }
}

import path from 'node:path';
import fs from 'node:fs/promises';
import { type ToolingLogger } from './meta';
import { toFilename } from './symbols';
import { IconDefaultConfig, type IconConfig, type DefinedIcons } from './registry';
import { normalizeFills, normalizeNums, normalizeThemes, unique } from '../shared/utils';

export interface CleanupMaterialSymbolsOptions {
  rootDir?: string;
  logger?: ToolingLogger;
  clearAll?: boolean;
}

export interface CleanupMaterialSymbolsResult {
  removedFiles: number;
  keptFiles: number;
  scannedFiles: number;
  symbolsPath: string;
}

function defaultLogger(): ToolingLogger {
  return {
    info: (msg: string) => console.info(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string) => {
      throw new Error(msg);
    },
  };
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFilesRecursive(full)));
      continue;
    }
    if (entry.isFile()) {
      out.push(full);
    }
  }

  return out;
}

async function removeEmptyDirsRecursive(dir: string): Promise<boolean> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    await removeEmptyDirsRecursive(path.join(dir, entry.name));
  }

  const after = await fs.readdir(dir);
  if (after.length === 0) {
    await fs.rmdir(dir);
    return true;
  }

  return false;
}

function buildDesiredRelativeFiles(iconsDef: DefinedIcons): Set<string> {
  const desired = new Set<string>();
  const iconsMap = iconsDef.Symbols;
  const defaults: Partial<IconConfig> = iconsDef.Default ?? {};

  for (const [icon, meta] of Object.entries(iconsMap)) {
    const sizes = normalizeNums(meta.sizes ?? defaults.sizes, IconDefaultConfig.sizes);
    const weights = normalizeNums(meta.weights ?? defaults.weights, IconDefaultConfig.weights);
    const fills = normalizeFills(meta.fills ?? defaults.fills, IconDefaultConfig.fills);
    const themes = normalizeThemes(meta.themes ?? defaults.themes, IconDefaultConfig.themes);

    for (const theme of unique(themes)) {
      for (const weight of unique(weights)) {
        for (const filled of unique(fills)) {
          for (const size of unique(sizes)) {
            desired.add(path.join(theme, toFilename(icon, filled as 0 | 1, weight, size)));
          }
        }
      }
    }
  }

  return desired;
}

export async function cleanupMaterialSymbolsCache(
  iconsDef: DefinedIcons,
  opts: CleanupMaterialSymbolsOptions = {},
): Promise<CleanupMaterialSymbolsResult> {
  if (!iconsDef || !iconsDef.Symbols) {
    throw new Error('[vue-material-symbol] Parameter must be the return value of defineIcons()');
  }

  const rootDir = opts.rootDir ?? process.cwd();
  const logger = opts.logger ?? defaultLogger();
  const clearAll = opts.clearAll ?? false;

  const symbolsPath = path.resolve(
    rootDir,
    'node_modules',
    '@hyrioo',
    'vue-material-symbol',
    '.temp',
    'symbols',
  );

  if (!(await exists(symbolsPath))) {
    logger.info(`[vue-material-symbol] Nothing to cleanup at ${symbolsPath}`);
    return { removedFiles: 0, keptFiles: 0, scannedFiles: 0, symbolsPath };
  }

  if (clearAll) {
    const files = await listFilesRecursive(symbolsPath);
    await fs.rm(symbolsPath, { recursive: true, force: true });
    logger.info(`[vue-material-symbol] Cleanup done. Removed all cached symbols: ${files.length}`);
    return {
      removedFiles: files.length,
      keptFiles: 0,
      scannedFiles: files.length,
      symbolsPath,
    };
  }

  const desired = buildDesiredRelativeFiles(iconsDef);
  const files = await listFilesRecursive(symbolsPath);

  let removedFiles = 0;
  let keptFiles = 0;

  for (const file of files) {
    const rel = path.relative(symbolsPath, file);
    if (desired.has(rel)) {
      keptFiles++;
      continue;
    }

    await fs.rm(file, { force: true });
    removedFiles++;
  }

  await removeEmptyDirsRecursive(symbolsPath).catch(() => {
    // best-effort; do not fail cleanup if empty-dir removal races
  });

  logger.info(
    `[vue-material-symbol] Cleanup done. Removed: ${removedFiles}, Kept: ${keptFiles}, Scanned: ${files.length}`,
  );

  return {
    removedFiles,
    keptFiles,
    scannedFiles: files.length,
    symbolsPath,
  };
}

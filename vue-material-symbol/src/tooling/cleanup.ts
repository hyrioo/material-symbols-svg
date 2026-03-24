import path from 'node:path';
import fs from 'node:fs/promises';
import type { DefinedIcons } from './registry';
import { buildSymbolVariantMatrix } from './core/matrix';
import { defaultLogger, exists, resolveToolingPaths, type ToolingLogger } from './core/fs-download';

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
  const paths = resolveToolingPaths(rootDir);
  const symbolsPath = paths.symbolsDir;

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

  const desired = new Set(buildSymbolVariantMatrix(iconsDef, symbolsPath).map((row) => row.relativeFile));
  const files = await listFilesRecursive(symbolsPath);

  let removedFiles = 0;
  let keptFiles = 0;

  for (const file of files) {
    const rel = path.relative(symbolsPath, file).replace(/\\/g, '/');
    if (desired.has(rel)) {
      keptFiles++;
      continue;
    }

    await fs.rm(file, { force: true });
    removedFiles++;
  }

  await removeEmptyDirsRecursive(symbolsPath).catch(() => {
    // best-effort
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

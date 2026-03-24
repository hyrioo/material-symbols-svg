import path from 'node:path';
import type { DefinedIcons } from './registry';
import { configureSymbolConfig, type DiagnosticsMode } from '../shared/config';
import { buildSymbolVariantMatrix } from './core/matrix';
import { resolveMaterialSymbolMetadata } from './core/metadata';
import {
  defaultLogger,
  downloadFromMatrix,
  ensureDir,
  resolveToolingPaths,
  type ToolingLogger,
} from './core/fs-download';
import { writeArtifacts } from './core/artifacts';

export interface SyncMaterialSymbolsOptions {
  rootDir?: string;
  concurrency?: number;
  strict?: boolean;
  diagnostics?: DiagnosticsMode;
}

export interface SyncMaterialSymbolsInternalOptions extends SyncMaterialSymbolsOptions {
  logger?: ToolingLogger;
}

export interface SyncMaterialSymbolsInternalResult {
  saved: number;
  skipped: number;
  failed: number;
  loaderMapSource: string;
}

export async function syncMaterialSymbolsInternal(
  iconsDef: DefinedIcons,
  opts: SyncMaterialSymbolsInternalOptions = {},
): Promise<SyncMaterialSymbolsInternalResult> {
  if (!iconsDef || !iconsDef.Symbols) {
    throw new Error('[vue-material-symbol] Parameter must be the return value of defineIcons()');
  }

  const options = {
    rootDir: opts.rootDir ?? process.cwd(),
    concurrency: opts.concurrency ?? 8,
    strict: opts.strict ?? false,
    diagnostics: opts.diagnostics ?? 'dev',
    logger: opts.logger ?? defaultLogger(),
  };

  configureSymbolConfig({ diagnostics: options.diagnostics });
  const paths = resolveToolingPaths(options.rootDir);
  await ensureDir(paths.tempDir);
  await ensureDir(path.dirname(paths.iconTypesFile));

  const metadata = await resolveMaterialSymbolMetadata(
    options.logger,
    path.resolve(paths.tempDir, 'versions.json'),
    { strict: options.strict },
  );

  const matrix = buildSymbolVariantMatrix(iconsDef, paths.symbolsDir);
  const artifacts = await writeArtifacts(
    options.logger,
    {
      matrix,
      custom: iconsDef.Custom,
      materialSymbolIconUnion: metadata.unionType,
    },
    {
      iconTypesFile: paths.iconTypesFile,
      loaderMapFile: paths.loaderMapFile,
    },
  );

  const result = await downloadFromMatrix(matrix, {
    concurrency: options.concurrency,
    logger: options.logger,
  });

  if (result.failed > 0) {
    for (const failure of result.failures) {
      options.logger.warn(failure);
    }
    if (options.strict && options.logger.error) {
      options.logger.error(`[vue-material-symbol] ${result.failed} symbol download(s) failed`);
    }
  }

  return {
    saved: result.saved,
    skipped: result.skipped,
    failed: result.failed,
    loaderMapSource: artifacts.loaderMapSource,
  };
}

export async function syncMaterialSymbols(
  iconsDef: DefinedIcons,
  opts: SyncMaterialSymbolsOptions = {},
): Promise<{ saved: number; skipped: number; failed: number }> {
  const res = await syncMaterialSymbolsInternal(iconsDef, opts);
  return { saved: res.saved, skipped: res.skipped, failed: res.failed };
}

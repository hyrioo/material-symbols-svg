import path from 'node:path';
import fs from 'node:fs/promises';
import { fetchVersions, type ToolingLogger } from './meta';
import { axesString, buildSymbolUrl, downloadSymbols, toFilename } from './symbols';
import { type DefinedIcons, IconDefaultConfig, generateConsumerFiles, type IconConfig } from './registry';
import { type Theme } from '../shared/types';
import { normalizeFills, normalizeNums, normalizeThemes, unique } from '../shared/utils';
import { configureSymbolConfig, type DiagnosticsMode } from '../shared/config';

const ANSI_RESET = '\x1b[0m';
const ANSI_CYAN = '\x1b[36m';
const ANSI_GREEN = '\x1b[32m';

function formatDownloadProgress(completed: number, total: number, color: boolean): string {
  if (!color) {
    return `[vue-material-symbol] Downloading symbols: ${completed}/${total}`;
  }

  return `${ANSI_CYAN}[vue-material-symbol]${ANSI_RESET} Downloading symbols: ${ANSI_GREEN}${completed}/${total}${ANSI_RESET}`;
}

export interface SyncMaterialSymbolsOptions {
  rootDir?: string;
  concurrency?: number;
  strict?: boolean;
  enabled?: boolean;
  diagnostics?: DiagnosticsMode;
  logger?: ToolingLogger;
  virtualLoaderMap?: boolean;
  onLoaderMapGenerated?: (source: string) => void;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
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

export async function syncMaterialSymbols(
  iconsDef: DefinedIcons,
  opts: SyncMaterialSymbolsOptions = {},
): Promise<{ saved: number; skipped: number; failed: number }> {
  const options = {
    rootDir: opts.rootDir ?? process.cwd(),
    concurrency: opts.concurrency ?? 8,
    strict: opts.strict ?? false,
    enabled: opts.enabled ?? true,
    diagnostics: opts.diagnostics ?? 'dev',
    logger: opts.logger ?? defaultLogger(),
    virtualLoaderMap: opts.virtualLoaderMap ?? false,
    onLoaderMapGenerated: opts.onLoaderMapGenerated,
  };

  configureSymbolConfig({ diagnostics: options.diagnostics });

  if (!options.enabled) {
    return { saved: 0, skipped: 0, failed: 0 };
  }

  if (!iconsDef || !iconsDef.Symbols) {
    throw new Error('[vue-material-symbol] Parameter must be the return value of defineIcons()');
  }

  const root = options.rootDir;
  const tempDir = path.resolve(root, 'node_modules', '@hyrioo', 'vue-material-symbol', '.temp');
  const outBase = path.resolve(tempDir, 'symbols');
  const distDir = path.resolve(root, 'node_modules', '@hyrioo', 'vue-material-symbol', 'dist');
  const srcSharedDir = path.resolve(root, 'node_modules', '@hyrioo', 'vue-material-symbol', 'dist', 'src', 'shared');
  const srcConsumerDir = path.resolve(root, 'node_modules', '@hyrioo', 'vue-material-symbol', 'dist', 'src', 'consumer');

  const versionsFile = path.resolve(tempDir, 'versions.json');
  const iconTypesFile = path.resolve(srcSharedDir, 'icon-types.d.ts');
  const loaderMapFile = path.resolve(distDir, 'loader-map.js');

  await ensureDir(tempDir);
  await ensureDir(srcSharedDir);

  await fetchVersions(options.logger, versionsFile, iconTypesFile, { strict: options.strict });
  const { loaderMapContent } = await generateConsumerFiles(
    options.logger,
    iconsDef,
    iconTypesFile,
    loaderMapFile,
    srcConsumerDir,
    { writeLoaderMap: !options.virtualLoaderMap },
  );

  if (options.onLoaderMapGenerated) {
    options.onLoaderMapGenerated(loaderMapContent);
  }

  const iconsMap = iconsDef.Symbols;
  const defaults: Partial<IconConfig> = iconsDef.Default ?? {};
  const tasks: { url: string; file: string }[] = [];

  for (const [icon, meta] of Object.entries(iconsMap)) {
    const sizes = normalizeNums(meta.sizes ?? defaults.sizes, IconDefaultConfig.sizes);
    const weights = normalizeNums(meta.weights ?? defaults.weights, IconDefaultConfig.weights);
    const fills = normalizeFills(meta.fills ?? defaults.fills, IconDefaultConfig.fills);
    const themes = normalizeThemes(meta.themes ?? defaults.themes, IconDefaultConfig.themes);

    for (const theme of unique(themes)) {
      await ensureDir(path.resolve(outBase, theme));
      for (const weight of unique(weights)) {
        for (const filled of unique(fills)) {
          for (const size of unique(sizes)) {
            const axes = axesString(weight, filled as 0 | 1);
            const url = buildSymbolUrl(theme as Theme, icon, axes, size);
            const file = path.resolve(outBase, theme, toFilename(icon, filled as 0 | 1, weight, size));
            tasks.push({ url, file });
          }
        }
      }
    }
  }

  const canInlineProgress = typeof process !== 'undefined' && Boolean(process.stdout?.isTTY);
  let lastLoggedProgress = -1;
  const result = await downloadSymbols(tasks, options.concurrency, {
    onProgress: ({ completed, total }) => {
      if (total <= 0) return;
      if (completed === lastLoggedProgress) return;
      lastLoggedProgress = completed;
      if (canInlineProgress) {
        process.stdout.write(`\r${formatDownloadProgress(completed, total, true)}`);
      } else {
        options.logger.info(formatDownloadProgress(completed, total, false));
      }
    },
  });

  if (canInlineProgress && lastLoggedProgress >= 0) {
    process.stdout.write('\n');
  }

  if (result.failed > 0) {
    for (const failure of result.failures) {
      options.logger.warn(failure);
    }
    if (options.strict && options.logger.error) {
      options.logger.error(`[vue-material-symbol] ${result.failed} symbol download(s) failed`);
    }
  }

  return result;
}

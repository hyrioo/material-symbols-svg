import path from 'node:path';
import type { Plugin } from 'vite';
import { syncMaterialSymbolsInternal, type DiagnosticsMode } from '@hyrioo/vue-material-symbol/tooling';
import { loadIconsDefinition } from './icons-definition';
import { styleError, styleInfo, styleWarn } from './logger';
import {
  ensureDefaultExport,
  isVirtualLoaderMapId,
  isVueMaterialSymbolConsumerPath,
  RESOLVED_VIRTUAL_LOADER_MAP_ID,
  VIRTUAL_LOADER_MAP_ID,
} from './virtual-loader-map';

export interface MaterialSymbolsPluginOptions {
  iconsFile: string;
  concurrency?: number;
  strict?: boolean;
  enabled?: boolean;
  diagnostics?: DiagnosticsMode;
}

function mergeUnique(values: readonly string[], additions: readonly string[]): string[] {
  return Array.from(new Set([...values, ...additions]));
}

export function materialSymbolsSvg(opts: MaterialSymbolsPluginOptions): Plugin {
  if (!opts?.iconsFile) {
    throw new Error('[material-symbols-svg] options.iconsFile is required');
  }

  const options = {
    iconsFile: opts.iconsFile,
    concurrency: opts.concurrency ?? 4,
    strict: opts.strict ?? false,
    enabled: opts.enabled ?? true,
    diagnostics: opts.diagnostics ?? 'dev',
  };

  let root = '';
  let loaderMapSource = 'const RAW_MAP = {};\nexport default RAW_MAP;\n';
  let watchedIconFiles = new Set<string>();

  async function syncIcons(
    logger: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void },
  ): Promise<boolean> {
    const { iconsDef, watchedFiles } = await loadIconsDefinition(root || process.cwd(), options.iconsFile);
    watchedIconFiles = new Set(Array.from(watchedFiles, (file) => path.resolve(file)));
    const before = loaderMapSource;

    const result = await syncMaterialSymbolsInternal(iconsDef, {
      rootDir: root,
      concurrency: options.concurrency,
      strict: options.strict,
      diagnostics: options.diagnostics,
      logger,
    });
    loaderMapSource = ensureDefaultExport(result.loaderMapSource);

    return loaderMapSource !== before;
  }

  return {
    name: 'material-symbols-svg',
    enforce: 'pre',
    configResolved(config) {
      root = config.root || process.cwd();
    },
    config(config) {
      return {
        optimizeDeps: {
          ...config.optimizeDeps,
          exclude: mergeUnique(config.optimizeDeps?.exclude ?? [], [
            '@hyrioo/vue-material-symbol',
            '@hyrioo/vue-material-symbol/consumer',
          ]),
        },
      };
    },
    resolveId(source, importer) {
      if (isVirtualLoaderMapId(source)) {
        return RESOLVED_VIRTUAL_LOADER_MAP_ID;
      }

      const importerPath = importer ? importer.split('?', 1)[0].split('#', 1)[0] : '';
      if (source === './loader-map.js' && isVueMaterialSymbolConsumerPath(importerPath)) {
        return RESOLVED_VIRTUAL_LOADER_MAP_ID;
      }

      return null;
    },
    transform(code, id) {
      if (!isVueMaterialSymbolConsumerPath(id)) {
        return null;
      }

      if (!code.includes('./loader-map.js')) {
        return null;
      }

      return code.replace('./loader-map.js', `${VIRTUAL_LOADER_MAP_ID}`);
    },
    load(id) {
      if (isVirtualLoaderMapId(id)) {
        return ensureDefaultExport(loaderMapSource);
      }
      return null;
    },
    async buildStart() {
      if (!options.enabled) return;

      await syncIcons({
        info: (msg: string) => this.info(styleInfo(msg)),
        warn: (msg: string) => this.warn(styleWarn(msg)),
        error: (msg: string) => this.error(styleError(msg)),
      });

      for (const file of watchedIconFiles) {
        this.addWatchFile(file);
      }
    },
    async handleHotUpdate(ctx) {
      if (!options.enabled) return;

      const changedFile = path.resolve(ctx.file);
      const defaultTarget = path.resolve(root || process.cwd(), options.iconsFile);
      const isTrackedChange = watchedIconFiles.size
        ? watchedIconFiles.has(changedFile)
        : changedFile === defaultTarget;

      if (!isTrackedChange) {
        return;
      }

      const changed = await syncIcons({
        info: (msg: string) => ctx.server.config.logger.info(styleInfo(msg)),
        warn: (msg: string) => ctx.server.config.logger.warn(styleWarn(msg)),
        error: (msg: string) => {
          throw new Error(styleError(msg));
        },
      });

      if (!changed) {
        return [];
      }

      const mod =
        ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_LOADER_MAP_ID) ||
        ctx.server.moduleGraph.getModuleById(VIRTUAL_LOADER_MAP_ID);
      if (!mod) {
        return [];
      }

      ctx.server.moduleGraph.invalidateModule(mod);
      return [mod];
    },
  };
}

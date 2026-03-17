import path from "node:path";
import { syncMaterialSymbols } from "@hyrioo/vue-material-symbol/tooling";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import { build } from "esbuild";
function isSvgFileSource(value) {
  return Boolean(value && typeof value === "object" && "__hyriooSvgFile" in value);
}
function asRecord(value) {
  return value && typeof value === "object" ? value : null;
}
function resolveWatchCandidate(projectRoot, iconsDir, sourcePath) {
  if (path.isAbsolute(sourcePath)) return path.resolve(sourcePath);
  return sourcePath.startsWith(".") ? path.resolve(iconsDir, sourcePath) : path.resolve(projectRoot, sourcePath);
}
function collectWatchFiles(projectRoot, absIconsFile, iconsDef) {
  const files = /* @__PURE__ */ new Set([path.resolve(absIconsFile)]);
  const iconsDir = path.dirname(absIconsFile);
  const custom = asRecord(iconsDef.Custom);
  if (!custom) return files;
  for (const sizeMap of Object.values(custom)) {
    const sizeRecord = asRecord(sizeMap);
    if (!sizeRecord) continue;
    for (const source of Object.values(sizeRecord)) {
      if (typeof source === "string" && (source.startsWith("./") || source.startsWith("../"))) {
        files.add(resolveWatchCandidate(projectRoot, iconsDir, source));
      } else if (isSvgFileSource(source)) {
        files.add(resolveWatchCandidate(projectRoot, iconsDir, source.__hyriooSvgFile));
      }
    }
  }
  return files;
}
async function importBundledModule(projectRoot, absIconsFile) {
  var _a, _b;
  const bundle = await build({
    entryPoints: [absIconsFile],
    absWorkingDir: projectRoot,
    platform: "node",
    format: "esm",
    bundle: true,
    write: false,
    target: "node18",
    loader: {
      ".svg": "text"
    },
    external: ["@hyrioo/vue-material-symbol", "@hyrioo/vue-material-symbol/*"]
  });
  const bundled = (_b = (_a = bundle.outputFiles) == null ? void 0 : _a[0]) == null ? void 0 : _b.text;
  if (!bundled) {
    throw new Error("iconsFile bundling produced no output");
  }
  const tmpBase = path.resolve(projectRoot, "node_modules", ".cache", "material-symbols-svg");
  await fs.mkdir(tmpBase, { recursive: true });
  const tmpDir = await fs.mkdtemp(path.join(tmpBase, "icons-"));
  const tmpFile = path.join(tmpDir, "icons.bundle.mjs");
  await fs.writeFile(tmpFile, bundled, "utf8");
  try {
    const href = `${pathToFileURL(tmpFile).href}?t=${Date.now()}`;
    return await import(href);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
async function loadIconsDefinition(root, iconsFile) {
  const projectRoot = root || process.cwd();
  const abs = path.resolve(projectRoot, iconsFile);
  try {
    const mod = await importBundledModule(projectRoot, abs);
    const iconsDef = mod == null ? void 0 : mod.default;
    if (!iconsDef || !iconsDef.Symbols) {
      throw new Error(
        `[material-symbols-svg] iconsFile must default export defineIcons(...). Fix: update ${iconsFile} to \`export default defineIcons(...)\`.`
      );
    }
    return {
      abs,
      iconsDef,
      watchedFiles: collectWatchFiles(projectRoot, abs, iconsDef)
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const maybeSvgImportIssue = detail.includes('Unknown file extension ".svg"') || detail.includes("ERR_UNKNOWN_FILE_EXTENSION");
    const hint = maybeSvgImportIssue ? " Fix: use `svg('./path/icon.svg')` from @hyrioo/vue-material-symbol/tooling (or keep .ts wrappers)." : "";
    throw new Error(`[material-symbols-svg] Failed to evaluate iconsFile with SVG support.${hint} Details: ${detail}`);
  }
}
const ANSI_RESET = "\x1B[0m";
const ANSI_CYAN = "\x1B[36m";
const ANSI_YELLOW = "\x1B[33m";
const ANSI_RED = "\x1B[31m";
const ANSI_GREEN = "\x1B[32m";
function supportsAnsiColor() {
  var _a;
  return typeof process !== "undefined" && Boolean((_a = process.stdout) == null ? void 0 : _a.isTTY);
}
function colorizePrefix(msg, color) {
  return msg.replace(/^\[([^\]]+)\]/, `${color}[$1]${ANSI_RESET}`);
}
function colorizeProgress(msg) {
  return msg.replace(/(\d+\/\d+)/, `${ANSI_GREEN}$1${ANSI_RESET}`);
}
function styleInfo(msg) {
  if (!supportsAnsiColor()) return msg;
  return colorizeProgress(colorizePrefix(msg, ANSI_CYAN));
}
function styleWarn(msg) {
  if (!supportsAnsiColor()) return msg;
  return colorizePrefix(msg, ANSI_YELLOW);
}
function styleError(msg) {
  if (!supportsAnsiColor()) return msg;
  return colorizePrefix(msg, ANSI_RED);
}
const VIRTUAL_LOADER_MAP_ID = "virtual:material-symbols-loader-map";
const RESOLVED_VIRTUAL_LOADER_MAP_ID = "\0virtual:material-symbols-loader-map";
function normalizeModuleId(id) {
  const base = id.split("?", 1)[0].split("#", 1)[0];
  try {
    return decodeURIComponent(base);
  } catch {
    return base;
  }
}
function isVirtualLoaderMapId(id) {
  const normalized = normalizeModuleId(id);
  return normalized === VIRTUAL_LOADER_MAP_ID || normalized === RESOLVED_VIRTUAL_LOADER_MAP_ID;
}
function isVueMaterialSymbolConsumerPath(id) {
  const normalized = normalizeModuleId(id).replace(/\\/g, "/");
  return normalized.includes("node_modules/@hyrioo/vue-material-symbol/dist/consumer.js") || normalized.endsWith("/vue-material-symbol/dist/consumer.js");
}
function ensureDefaultExport(source) {
  if (typeof source === "string" && source.includes("export default")) {
    return source;
  }
  return "const RAW_MAP = {};\nexport default RAW_MAP;\n";
}
function mergeUnique(values, additions) {
  return Array.from(/* @__PURE__ */ new Set([...values, ...additions]));
}
function materialSymbolsSvg(opts) {
  if (!(opts == null ? void 0 : opts.iconsFile)) {
    throw new Error("[material-symbols-svg] options.iconsFile is required");
  }
  const options = {
    iconsFile: opts.iconsFile,
    concurrency: opts.concurrency ?? 4,
    strict: opts.strict ?? false,
    enabled: opts.enabled ?? true,
    diagnostics: opts.diagnostics ?? "dev"
  };
  let root = "";
  let loaderMapSource = "const RAW_MAP = {};\nexport default RAW_MAP;\n";
  let watchedIconFiles = /* @__PURE__ */ new Set();
  async function syncIcons(logger) {
    const { iconsDef, watchedFiles } = await loadIconsDefinition(root || process.cwd(), options.iconsFile);
    watchedIconFiles = new Set(Array.from(watchedFiles, (file) => path.resolve(file)));
    const before = loaderMapSource;
    await syncMaterialSymbols(iconsDef, {
      rootDir: root,
      concurrency: options.concurrency,
      strict: options.strict,
      enabled: options.enabled,
      diagnostics: options.diagnostics,
      virtualLoaderMap: true,
      onLoaderMapGenerated: (source) => {
        loaderMapSource = ensureDefaultExport(source);
      },
      logger
    });
    return loaderMapSource !== before;
  }
  return {
    name: "material-symbols-svg",
    enforce: "pre",
    configResolved(config) {
      root = config.root || process.cwd();
    },
    config(config) {
      var _a;
      return {
        optimizeDeps: {
          ...config.optimizeDeps,
          exclude: mergeUnique(((_a = config.optimizeDeps) == null ? void 0 : _a.exclude) ?? [], [
            "@hyrioo/vue-material-symbol",
            "@hyrioo/vue-material-symbol/consumer"
          ])
        }
      };
    },
    resolveId(source, importer) {
      if (isVirtualLoaderMapId(source)) {
        return RESOLVED_VIRTUAL_LOADER_MAP_ID;
      }
      const importerPath = importer ? importer.split("?", 1)[0].split("#", 1)[0] : "";
      if (source === "./loader-map.js" && isVueMaterialSymbolConsumerPath(importerPath)) {
        return RESOLVED_VIRTUAL_LOADER_MAP_ID;
      }
      return null;
    },
    transform(code, id) {
      if (!isVueMaterialSymbolConsumerPath(id)) {
        return null;
      }
      if (!code.includes("./loader-map.js")) {
        return null;
      }
      return code.replace("./loader-map.js", `${VIRTUAL_LOADER_MAP_ID}`);
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
        info: (msg) => this.info(styleInfo(msg)),
        warn: (msg) => this.warn(styleWarn(msg)),
        error: (msg) => this.error(styleError(msg))
      });
      for (const file of watchedIconFiles) {
        this.addWatchFile(file);
      }
    },
    async handleHotUpdate(ctx) {
      if (!options.enabled) return;
      const changedFile = path.resolve(ctx.file);
      const defaultTarget = path.resolve(root || process.cwd(), options.iconsFile);
      const isTrackedChange = watchedIconFiles.size ? watchedIconFiles.has(changedFile) : changedFile === defaultTarget;
      if (!isTrackedChange) {
        return;
      }
      const changed = await syncIcons({
        info: (msg) => ctx.server.config.logger.info(styleInfo(msg)),
        warn: (msg) => ctx.server.config.logger.warn(styleWarn(msg)),
        error: (msg) => {
          throw new Error(styleError(msg));
        }
      });
      if (!changed) {
        return [];
      }
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_LOADER_MAP_ID) || ctx.server.moduleGraph.getModuleById(VIRTUAL_LOADER_MAP_ID);
      if (!mod) {
        return [];
      }
      ctx.server.moduleGraph.invalidateModule(mod);
      return [mod];
    }
  };
}
export {
  materialSymbolsSvg
};
//# sourceMappingURL=index.js.map

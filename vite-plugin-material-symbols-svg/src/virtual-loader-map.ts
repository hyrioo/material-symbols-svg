export const VIRTUAL_LOADER_MAP_ID = 'virtual:material-symbols-loader-map';
export const RESOLVED_VIRTUAL_LOADER_MAP_ID = '\0virtual:material-symbols-loader-map';

function normalizeModuleId(id: string): string {
  const base = id.split('?', 1)[0].split('#', 1)[0];
  try {
    return decodeURIComponent(base);
  } catch {
    return base;
  }
}

export function isVirtualLoaderMapId(id: string): boolean {
  const normalized = normalizeModuleId(id);
  return normalized === VIRTUAL_LOADER_MAP_ID || normalized === RESOLVED_VIRTUAL_LOADER_MAP_ID;
}

export function isVueMaterialSymbolConsumerPath(id: string): boolean {
  const normalized = normalizeModuleId(id).replace(/\\/g, '/');
  return (
    normalized.includes('node_modules/@hyrioo/vue-material-symbol/dist/consumer.js') ||
    normalized.endsWith('/vue-material-symbol/dist/consumer.js')
  );
}

export function ensureDefaultExport(source: string): string {
  if (typeof source === 'string' && source.includes('export default')) {
    return source;
  }

  return 'const RAW_MAP = {};\nexport default RAW_MAP;\n';
}

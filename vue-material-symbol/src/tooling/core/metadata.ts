import fs from 'node:fs/promises';
import type { ToolingLogger } from './fs-download';
import { exists } from './fs-download';

export interface MetadataOptions {
  strict?: boolean;
}

export interface MetadataResult {
  unionType: string;
  versions: Record<string, string | number>;
}

function toUnion(names: string[]): string {
  return names.length ? names.map((n) => `'${n.replace(/'/g, "\\'")}'`).join(' | ') : 'string';
}

async function parseVersionsFile(versionsFile: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(versionsFile, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function resolveMaterialSymbolMetadata(
  logger: ToolingLogger,
  versionsFile: string,
  options: MetadataOptions,
): Promise<MetadataResult> {
  if (await exists(versionsFile)) {
    const cached = await parseVersionsFile(versionsFile);
    if (cached) {
      const names = Object.keys(cached).sort((a, b) => a.localeCompare(b));
      return {
        unionType: toUnion(names),
        versions: Object.fromEntries(names.map((n) => [n, cached[n] as string | number])),
      };
    }
  }

  logger.info('[vue-material-symbol] Fetching Material Symbols metadata...');
  const metaUrl = 'https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true';

  try {
    const res = await fetch(metaUrl);
    if (!res.ok) {
      const msg = `Failed to fetch metadata: HTTP ${res.status}`;
      if (options.strict && logger.error) logger.error(`[vue-material-symbol] ${msg}`);
      else logger.warn(`[vue-material-symbol] ${msg}`);
      return { unionType: 'string', versions: {} };
    }

    let txt = await res.text();
    if (txt.startsWith(')]}\'')) {
      const i = txt.indexOf('\n');
      if (i !== -1) txt = txt.substring(i + 1);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(txt);
    } catch {
      const msg = 'Failed to parse metadata JSON';
      if (options.strict && logger.error) logger.error(`[vue-material-symbol] ${msg}`);
      else logger.warn(`[vue-material-symbol] ${msg}`);
      return { unionType: 'string', versions: {} };
    }

    if (!parsed || !Array.isArray(parsed.icons)) {
      await fs.writeFile(versionsFile, txt);
      return { unionType: 'string', versions: {} };
    }

    const versions: Record<string, string | number> = {};
    for (const icon of parsed.icons) {
      const families = Array.isArray((icon as any)?.unsupported_families)
        ? ((icon as any).unsupported_families as any[])
        : [];
      if (families.some((fam) => String(fam).toLowerCase().includes('symbols'))) continue;

      const name = String((icon as any)?.name || '');
      if (!name) continue;
      versions[name] = (icon as any)?.version;
    }

    const sortedNames = Object.keys(versions).sort((a, b) => a.localeCompare(b));
    const sorted = Object.fromEntries(sortedNames.map((n) => [n, versions[n]]));
    await fs.writeFile(versionsFile, JSON.stringify(sorted, null, 2));

    return {
      unionType: toUnion(sortedNames),
      versions: sorted,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (options.strict && logger.error) logger.error(`[vue-material-symbol] Metadata prefetch failed: ${msg}`);
    else logger.warn(`[vue-material-symbol] Metadata prefetch failed: ${msg}`);
    return { unionType: 'string', versions: {} };
  }
}

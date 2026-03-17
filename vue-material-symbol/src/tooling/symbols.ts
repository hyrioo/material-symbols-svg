import fs from 'node:fs/promises';
import { type Theme } from '../shared/types';

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export function axesString(weight: number, filled: 0 | 1) {
  const w = weight === 400 ? '' : `wght${weight}`;
  const f = filled === 0 ? '' : `fill${filled}`;
  const s = `${w}${f}`;
  return s.length ? s : 'default';
}

export function buildSymbolUrl(theme: Theme, icon: string, axes: string, size: number) {
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${theme}/${icon}/${axes}/${size}px.svg`;
}

export function toFilename(icon: string, filled: 0 | 1, weight: number, size: number) {
  const w = Number.isFinite(weight) ? `.w${weight}` : '';
  const s = Number.isFinite(size) ? `.s${size}` : '';
  const fillPart = filled === 1 ? '-fill' : '';
  return `${icon}${fillPart}${w}${s}.svg`;
}

async function removeIfNotSvg(file: string) {
  try {
    const str = await fs.readFile(file, 'utf8');
    const ok = str.startsWith('<svg') && str.includes('</svg>');
    if (!ok) await fs.rm(file, { force: true });
  } catch {
    // ignore
  }
}

export async function withConcurrency<T, R>(items: T[], limit: number, worker: (item: T, i: number) => Promise<R>) {
  const ret: R[] = [];
  let idx = 0;

  const run = async () => {
    while (idx < items.length) {
      const i = idx++;
      ret[i] = await worker(items[i], i);
    }
  };

  const runners = Array.from({ length: Math.min(limit, items.length) }, run);
  await Promise.all(runners);
  return ret;
}

export async function downloadSymbols(
  tasks: { url: string; file: string }[],
  concurrency: number,
  options: {
    onProgress?: (progress: { completed: number; total: number; saved: number; failed: number }) => void;
  } = {},
) {
  let failed = 0;
  let skipped = 0;
  let saved = 0;
  const failures: string[] = [];
  const toDownload: { url: string; file: string }[] = [];
  let completed = 0;

  await withConcurrency(tasks, concurrency, async (t) => {
    if (await exists(t.file)) {
      skipped++;
      return;
    }
    toDownload.push(t);
  });

  await withConcurrency(toDownload, concurrency, async (t) => {
    try {
      const res = await fetch(t.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svg = await res.text();
      if (!svg.startsWith('<svg')) throw new Error('Not an SVG');

      await fs.writeFile(t.file, svg);
      await removeIfNotSvg(t.file);
      saved++;
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      failures.push(`[vue-material-symbol] Failed ${t.url} -> ${t.file}: ${msg}`);
    } finally {
      completed++;
      options.onProgress?.({
        completed,
        total: toDownload.length,
        saved,
        failed,
      });
    }
  });

  return { saved, skipped, failed, toDownload: toDownload.length, failures };
}

# Vite Configuration

This page documents how to configure `materialSymbolsSvg(...)` in `vite.config.ts`.

## Basic setup

```ts
import { defineConfig } from 'vite';
import { materialSymbolsSvg } from '@hyrioo/vite-plugin-material-symbols-svg';

export default defineConfig({
  plugins: [
    materialSymbolsSvg({
      iconsFile: 'src/icons.ts',
    }),
  ],
});
```

`iconsFile` must point to a file that default exports the result of `defineIcons(...)`.

## Plugin options

```ts
materialSymbolsSvg({
  iconsFile: 'src/icons.ts',
  concurrency: 8,
  enabled: true,
  strict: false,
  diagnostics: 'dev',
});
```

- `iconsFile` (`string`, required): path to icon definition file, relative to Vite project root.
- `concurrency` (`number`, default `4`): max concurrent downloads while syncing symbols.
- `enabled` (`boolean`, default `true`): disables all sync/virtual-loader behavior when `false`.
- `strict` (`boolean`, default `false`): throws on sync failures instead of warning.
- `diagnostics` (`'dev' | 'always' | 'off'`, default `'dev'`): controls diagnostics visibility.
  - `'dev'`: warnings outside production only.
  - `'always'`: warnings in all environments.
  - `'off'`: suppress plugin/tooling diagnostics.

## Example: local/dev-friendly config

```ts
materialSymbolsSvg({
  iconsFile: 'src/icons.ts',
  concurrency: 4,
  diagnostics: 'dev',
  strict: false,
});
```

## Example: CI/strict config

```ts
materialSymbolsSvg({
  iconsFile: 'src/icons.ts',
  diagnostics: 'always',
  strict: true,
});
```

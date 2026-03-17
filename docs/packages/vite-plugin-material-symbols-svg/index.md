# @hyrioo/vite-plugin-material-symbols-svg

Vite plugin that syncs symbol assets from your `defineIcons(...)` config and wires the runtime loader map into your app.

## In This Section

- [Vite Configuration](/packages/vite-plugin-material-symbols-svg/vite-configuration)

## Setup Flow

```ts
// icons.ts
import { defineIcons, svg } from '@hyrioo/vue-material-symbol/tooling';

export default defineIcons(
  {
    folder: {},
    language: {},
    logout: { sizes: [24], weights: [200, 400] },
  },
  {
    spark: { 24: svg('./custom/spark.svg') },
  },
  {
    sizes: [20, 24, 40, 48],
    weights: [400],
    fills: [false],
    themes: ['rounded'],
  }
);
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { materialSymbolsSvg } from '@hyrioo/vite-plugin-material-symbols-svg';

export default defineConfig({
  plugins: [
    materialSymbolsSvg({
      iconsFile: 'src/icons.ts',
      diagnostics: 'dev',
    }),
  ],
});
```

`iconsFile` is required and must default export `defineIcons(...)`.
For the `defineIcons` API itself, see
[Define Icons](/packages/vue-material-symbol/define-icons).

`diagnostics` controls warning visibility:

- `'dev'` (default): warnings only outside production
- `'always'`: warnings in all environments
- `'off'`: disable warnings

This plugin updates the virtual loader map on icon config changes and lets Vite apply HMR where possible.

Next steps:

- Configure plugin options and behavior: [Vite Configuration](/packages/vite-plugin-material-symbols-svg/vite-configuration)

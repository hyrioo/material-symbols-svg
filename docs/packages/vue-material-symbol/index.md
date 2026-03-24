# @hyrioo/vue-material-symbol

Vue 3 component for rendering Material Symbols SVG icons with typed icon names, variant selection, and fill/stroke controls.

## In This Section

- [Define Icons](/packages/vue-material-symbol/define-icons)
- [Defaults](/packages/vue-material-symbol/defaults)
- [Props](/packages/vue-material-symbol/props)
- [Examples](/packages/vue-material-symbol/examples)

## Setup Flow

```ts
// icons.ts
import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';

export default defineIcons(
  { folder: {}, language: {} },
  {},
  { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] },
);
```

Use one of these sync paths:

1. Vite plugin flow: add `materialSymbolsSvg({ iconsFile: 'src/icons.ts' })` in `vite.config.ts`.
2. Manual flow: run `download` and optionally `cleanup` from the installation guide.

```vue
<!-- AnyComponent.vue -->
<script setup lang="ts">
import { MaterialSymbol } from '@hyrioo/vue-material-symbol';
</script>

<template>
  <material-symbol icon="folder" :size="24" fills="text" />
</template>
```

```ts
// main.ts
import { configureMaterialSymbolDefaultProps } from '@hyrioo/vue-material-symbol';

configureMaterialSymbolDefaultProps({
  weight: 400,
  theme: 'rounded',
});
```

Next steps:

- Define your icon catalog: [Define Icons](/packages/vue-material-symbol/define-icons)
- Tune app-wide defaults: [Defaults](/packages/vue-material-symbol/defaults)
- See full prop API: [Props](/packages/vue-material-symbol/props)
- Explore usage patterns: [Examples](/packages/vue-material-symbol/examples)

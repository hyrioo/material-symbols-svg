# Vue Component Examples

Use these examples as copy-paste starting points for common icon rendering patterns.

## Basic icon

```vue
<template>
  <material-symbol icon="folder" :size="24" fills="text" />
</template>
```

## Typed icon name

```ts
import type { IconKey } from '@hyrioo/vue-material-symbol/consumer';

const icon: IconKey = 'home';
```

```vue
<template>
  <material-symbol :icon="icon" :size="24" />
</template>
```

## Theme, weight, and filled variants

```vue
<template>
  <material-symbol icon="translate" theme="rounded" :weight="400" :filled="false" />
  <material-symbol icon="translate" theme="outlined" :weight="200" :filled="true" />
</template>
```

## Size and optical size

```vue
<template>
  <!-- Rendered as 32x32 but requests optical-size bucket 24 -->
  <material-symbol icon="home" :size="32" :opticalSize="24" />

  <!-- Explicit width/height -->
  <material-symbol icon="home" :size="{ width: 48, height: 32 }" />
</template>
```

## Fill and stroke shortcuts

```vue
<template>
  <!-- Uses currentColor -->
  <material-symbol icon="spark" fills="text" strokes="text" />

  <!-- Preserves original SVG values -->
  <material-symbol icon="spark" fills="keep" strokes="keep" />
</template>
```

## Per-path color arrays

```vue
<template>
  <material-symbol
    icon="spark"
    :fills="['#0ea5e9', '#22c55e', 'keep']"
    :strokes="['keep', '#0f172a', '#ef4444']"
  />
</template>
```

## Per-path color map by SVG id

Example custom SVG (note the `id` values):

```xml
<svg viewBox="0 0 24 24">
  <path id="primary" d="M4 4h16v16H4z" />
  <path id="accent" d="M7 7h10v10H7z" />
  <path id="outline" d="M3 3h18v18H3z" fill="none" />
</svg>
```

```vue
<template>
  <material-symbol
    icon="spark"
    :fills="{ primary: '#145131', accent: '#5F9ED7' }"
    :strokes="{ outline: '#0f172a' }"
  />
</template>
```

## App-level color schemes

```ts
import { configureMaterialSymbolDefaultProps } from '@hyrioo/vue-material-symbol';

configureMaterialSymbolDefaultProps({
  colorSchemes: {
    brand: ['#145131', '#5F9ED7'],
    danger: '#ef4444',
  },
});
```

```vue
<template>
  <material-symbol icon="home" fills="brand" />
  <material-symbol icon="warning" fills="danger" strokes="danger" />
</template>
```

## Gradient fill

```vue
<template>
  <svg style="visibility: hidden; height: 0; width: 0;">
    <defs>
      <linearGradient id="icon-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5F9ED7" />
        <stop offset="90%" stop-color="#145131" />
      </linearGradient>
    </defs>
  </svg>

  <material-symbol icon="spark" fills="url(#icon-gradient)" />
</template>
```

## Custom icon from defineIcons custom map

```ts
// icons.ts
import { defineIcons, svg } from '@hyrioo/vue-material-symbol/tooling';

export default defineIcons(
  { home: {} },
  {
    spark: { 24: svg('./custom/spark.svg') },
  },
  { sizes: [24], weights: [400], fills: [false], themes: ['rounded'] },
);
```

```vue
<template>
  <material-symbol icon="spark" :size="24" />
</template>
```

## Dynamic icon from state

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IconKey } from '@hyrioo/vue-material-symbol/consumer';

const online = ref(true);
const icon = computed<IconKey>(() => (online.value ? 'wifi' : 'wifi_off'));
</script>

<template>
  <material-symbol :icon="icon" fills="text" />
</template>
```

## Loader map requirement

`@hyrioo/vue-material-symbol` requires a populated loader map to render symbols.
Populate it with the Vite plugin flow or by running the manual `download` command from the installation guide.

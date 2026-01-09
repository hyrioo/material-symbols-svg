
# Install

Npm
```npm
npm add @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```
Yarn
```yarn
yarn add @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

# Setup 
```typescript
// icons.ts
import { defineIcons } from '@hyrioo/vite-plugin-material-symbols-svg';

export const Icons = defineIcons({
    folder: {},
    language: {},
    logout: {sizes: [24], weights: [200,400]},
}, {
    spark: {24: import('./custom/spark.ts')},
}, {
    sizes: [20, 24, 40, 48],
    weights: [400],
    fills: [0],
    themes: ['rounded'],
});


// vite.config.ts
import { materialSymbolsSvg } from '@hyrioo/vite-plugin-material-symbols-svg';
import Icons from './icons.ts';

export default defineConfig({
    plugins: [
        materialSymbolsSvg(Icons),
    ],
});


// main.ts
import { configureMaterialSymbolDefaultProps } from '@hyrioo/vue-material-symbol';

configureMaterialSymbolDefaultProps({
    weight: 400,
});

```

# Usage
```vue
<material-symbol icon="spark" :size="24" fills="current" />
<material-symbol icon="spark" :size="24" :fills="['red', 'keep']" />
<material-symbol icon="spark" :size="24" :fills="{'id1': 'blue'}" />
 ```

### Gradient
```vue
<svg style="visibility: hidden; height: 0; width: 0;">
    <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stop-color="#5F9ED7" />
             <stop offset="90%" stop-color="#145131" />
        </linearGradient>
    </defs>
</svg>

<material-symbol icon="spark" :size="24" fills="url(#gradient)" />
```
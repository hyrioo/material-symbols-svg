
# Setup 
```typescript
// icons.ts
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
export default defineConfig({
    plugins: [
        materialSymbolsSvg(Icons),
    ],
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
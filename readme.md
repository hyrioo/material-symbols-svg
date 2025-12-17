
```typescript
// icons.ts
import spark from '@shared/icons/custom/spark.svg';

export const Icons = defineIcons({
    folder: {},
    language: {},
    logout: {sizes: [24]},
}, {
    spark: {24: spark},
});

export type IconKey = keyof typeof Icons.Symbols | keyof typeof Icons.Custom;
```

```typescript
// vite.config.ts
export default defineConfig({
    plugins: [
        materialSymbolsSvg({
            icons: Icons,
        }),
    ],
});
```

```typescript
// vite-env.d.ts
declare module '@hyrioo/vite-plugin-material-symbols-svg' {
    interface CIconEnv {
        IconKey: IconKey;
    }
}
```
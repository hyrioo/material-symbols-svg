# Define Icons

`defineIcons(...)` is the source of truth for which icons and variants are available.

## Signature

```ts
defineIcons(symbols, custom, defaults);
```

- `symbols`: built-in Material Symbols to include.
- `custom`: optional custom SVG icons by name and size.
- `defaults`: fallback variant settings used when a symbol does not override them.

## Complete example

```ts
import { defineIcons } from '@hyrioo/vue-material-symbol/tooling';

export default defineIcons(
  {
    folder: {},
    language: {},
    logout: { sizes: [24], weights: [200, 400] },
  },
  {
    spark: { 24: import('./custom/spark.svg') },
  },
  {
    sizes: [20, 24, 40, 48],
    weights: [400],
    fills: [false],
    themes: ['rounded'],
  },
);
```

## Built-in symbol map

Provide Material Symbols names and optional per-icon overrides.  
Any axis omitted on a symbol falls back to `defaults`.

```ts
{
  folder: {},
  language: {},
  logout: { sizes: [24], weights: [200, 400] },
}
```

## Custom source map

Provide additional custom icon sources by name and optical size.  
The icon name becomes a valid `IconKey` in `<material-symbol icon="..." />`.

```ts
{
  spark: { 24: import('./custom/spark.svg') },
}
```

## Global defaults

Set fallback defaults for the full icon catalog.  
These values are used whenever a symbol does not define its own `sizes`, `weights`, `fills`, or `themes`.

```ts
{
  sizes: [20, 24, 40, 48],
  weights: [400],
  fills: [false],
  themes: ['rounded'],
}
```

## Rules and tips

- Prefer shared values in `defaults`, then override only exceptions per icon.
- Keep `sizes` to supported buckets (`20 | 24 | 40 | 48`) for predictable output.
- Use `fills: [false]` unless you explicitly need filled variants.
- If a requested variant is missing at runtime, add it in `defineIcons` or choose an available variant.

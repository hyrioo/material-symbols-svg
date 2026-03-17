# Vue Component Defaults

Use `configureMaterialSymbolDefaultProps` to set application-level defaults for `<material-symbol />`.

```ts
import { configureMaterialSymbolDefaultProps } from '@hyrioo/vue-material-symbol';

configureMaterialSymbolDefaultProps({
  weight: 400,
  theme: 'rounded',
  filled: false,
  fills: 'text',
  strokes: null,
  colorSchemes: {
    brand: ['#145131', '#5F9ED7'],
  },
});
```

## Options

- `weight`: symbol weight axis (`100 | 200 | 300 | 400 | 500 | 600 | 700`)
- `theme`: symbol family (`'rounded' | 'outlined' | 'sharp'`)
- `filled`: filled variant toggle (`boolean`)
- `fills`: default fill colors (`'text' | 'keep' | string | string[] | Record<string, ...>`)
- `strokes`: default stroke colors (same shape as `fills`)
- `colorSchemes`: named fill/stroke presets (referenced by `fills`/`strokes` string key)

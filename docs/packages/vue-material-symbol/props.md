# Vue Component Props

Use this page for per-instance `<material-symbol />` props. For app-wide defaults, see
[Defaults](/packages/vue-material-symbol/defaults).

## `icon`

- Type: `IconKey`
- Required: `true`
- Description: Icon name from your configured icon registry.

## `weight`

- Type: `Weight` (`100 | 200 | 300 | 400 | 500 | 600 | 700`)
- Required: `false`
- Default: `materialSymbolDefaultProps.weight`
- Description: Selects the symbol weight axis.

## `theme`

- Type: `Theme` (`'rounded' | 'outlined' | 'sharp'`)
- Required: `false`
- Default: `materialSymbolDefaultProps.theme`
- Description: Selects symbol family/style.

## `filled`

- Type: `Filled` (`boolean`)
- Required: `false`
- Default: `materialSymbolDefaultProps.filled`
- Description: Enables filled variant when available.

## `fills`

- Type: `ColorProp`
- Required: `false`
- Default: `materialSymbolDefaultProps.fills`
- Description: Fill color control.

Accepted values:

- `string` (`'text'`, `'keep'`, CSS color, gradient `url(...)`)
- `string[]` (per-path fill list by SVG child index)
- `Record<string, string | null>` (per-path fill keyed by SVG element `id`)

String shortcuts:

- `'text'`: uses `currentColor` so the icon follows surrounding text color.
- `'keep'`: preserves each path's original fill value from the source SVG.

## `strokes`

- Type: `ColorProp`
- Required: `false`
- Default: `materialSymbolDefaultProps.strokes`
- Description: Stroke color control with same shape as `fills`.

Accepted values:

- `string` (`'text'`, `'keep'`, CSS color, gradient `url(...)`)
- `string[]` (per-path stroke list by SVG child index)
- `Record<string, string | null>` (per-path stroke keyed by SVG element `id`)

String shortcuts for strokes follow the same behavior:

- `'text'`: uses `currentColor` for stroke.
- `'keep'`: preserves original stroke values from the source SVG.

## `size`

- Type: `number | { width: number; height: number }`
- Required: `false`
- Default: `24`
- Description: Rendered size for the `<svg>` output. Also used to infer optical size when `opticalSize` is not set.

## `opticalSize`

- Type: `OpticalSize | null` (`20 | 24 | 40 | 48 | null`)
- Required: `false`
- Default: `null`
- Description: Explicitly controls symbol optical-size bucket selection.

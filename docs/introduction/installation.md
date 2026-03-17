# Installation

Install both packages if you want the full workflow (build-time icon registry + Vue runtime component).

## Install both packages

::: code-group

```bash [npm]
npm install @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

```bash [yarn]
yarn add @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

```bash [pnpm]
pnpm install @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

:::

## Install the Vite plugin (requires Vue package)

::: code-group

```bash [npm]
npm install @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

```bash [yarn]
yarn add @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

```bash [pnpm]
pnpm install @hyrioo/vite-plugin-material-symbols-svg @hyrioo/vue-material-symbol
```

:::

## Install only the Vue component

::: code-group

```bash [npm]
npm install @hyrioo/vue-material-symbol
```

```bash [yarn]
yarn add @hyrioo/vue-material-symbol
```

```bash [pnpm]
pnpm install @hyrioo/vue-material-symbol
```

:::

## Manual registry sync command

::: code-group

```bash [npm]
npx @hyrioo/vue-material-symbol download ./icons.mjs --export Icons
```

```bash [pnpm]
pnpm dlx @hyrioo/vue-material-symbol download ./icons.mjs --export Icons
```

:::

## Cleanup cached downloads

::: code-group

```bash [npm]
npx @hyrioo/vue-material-symbol cleanup ./icons.mjs --export Icons
```

```bash [pnpm]
pnpm dlx @hyrioo/vue-material-symbol cleanup ./icons.mjs --export Icons
```

:::

To clear all cached symbols regardless of current icon config:

```bash
npx @hyrioo/vue-material-symbol cleanup ./icons.mjs --export Icons --all
```

# Overall Value

This project combines two packages that solve different layers of the same icon workflow:

- `@hyrioo/vue-material-symbol` provides the Vue component plus shared icon tooling.
- `@hyrioo/vite-plugin-material-symbols-svg` is a thin Vite hook that triggers sync and serves loader-map virtually.

## Why this combination works

- Download only the SVGs you reference, keeping icon assets focused.
- Define icon registry once, then consume it consistently in app code.
- Keep build logic and UI rendering concerns separated but compatible.

## When to use both

Use both packages together when you want:

- Material Symbols with minimal manual asset management.
- A typed, repeatable icon configuration pipeline.
- A simple Vue component API for final rendering and fill customization.

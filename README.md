# Codemod

This codemod rewrites imports to include the `.js` extension as expected when `moduleResolution` is set to `NodeNext` in your `tsconfig.json`.

It supports `.ts` and `.tsx` files.

## Usage

`npx node-to-nodenext <PATH>`

## Note

This errors for (and skips) files that include `satisfies` or other new typescript syntax. This is because `jscodeshift` uses an old version
of `recast`, which in turn uses an old version of `ast-types`. If you want to hack your way around that, install this package locally and
add a version override for the `ast-types` package to your package.json:

E.g. for `pnpm`:

```json
"pnpm": {
  "overrides": {
    "ast-types": "0.16.1"
  }
}
```

Or for `yarn`:

```json
"resolutions": {
  "ast-types": "0.16.1"
}
```

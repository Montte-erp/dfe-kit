# DFeKit provider package work

Use this skill when adding or changing a municipal provider package under `packages/*`, adapter engine code under `adapters/*`, or public fiscal contracts under `core/fiscal`.

## Package boundaries

- Provider packages live in `packages/*` and are the intended published artifacts.
- Core and adapter packages are private implementation packages and should be inlined into published provider bundles with bunup `noExternal` / `dts.resolve`.
- Importing package metadata should not instantiate HTTP clients, XML parsers, configured providers, certificates, or networking.
- Entry points must expose meaningful configuration/public API, not barrel-only re-exports.

## Public API shape

- Public provider operations return typed `Effect.Effect` values.
- Fiscal rejection is returned as success with `providerResponse.status === "rejected"` and rejection data.
- Technical faults are typed Effect failures from the adapter error catalog.
- Certificate handling stays outside DFeKit.
- XML signing is an injectable Effect-native `signer` hook, off by default.

## Provider capability honesty

Do not fake support.

- If a flow was not proven in homologation, encode capability metadata as `unsupported` or `unverified_in_homologation`.
- Preserve raw XML, protocol, provider response, request metadata, and lifecycle events.
- Keep provider-specific fiscal quirks in the adapter/provider package, not generic core, until at least two real consumers justify extraction.

## File placement

- Adapter config, schemas, typed error catalogs, credentials, event definitions, and provider options belong together in adapter/package `config.ts`.
- XML primitives belong in `core/xml` only if generic and reusable.
- CPF/CNPJ and generic validation primitives belong in `core/utils`.
- Fiscal contracts shared by providers belong in `core/fiscal`.
- Avoid `types.ts` catch-all files.

## Build and publication checks

For a changed provider package, run the narrowest useful checks:

```bash
nx run @dfe-kit/adapter-saatri:typecheck
nx run @dfe-kit/adapter-saatri:test
nx run @dfe-kit/adapter-saatri:build
nx run @dfe-kit/jacobina-saatri:typecheck
nx run @dfe-kit/jacobina-saatri:test
nx run @dfe-kit/jacobina-saatri:build
```

For release-facing changes, also check:

```bash
bun run check
bun run publint
```

## Bunup/DTS rules

- Use the shared preset in `tooling/bunup`.
- Keep packages ESM-only with explicit `exports` using the `import` condition.
- Use `sideEffects: false` unless there are real module-load side effects.
- Treat DTS warnings as publication risks; fix or document them before claiming release readiness.
- Keep public exported schemas/types stable and explicitly annotated where bunup/isolated declarations need help.

## Common pitfalls

- Creating a provider instance at module load.
- Hiding HTTP clients with deep `Effect.provide` instead of exporting a layer.
- Converting provider errors into generic strings.
- Marking a capability `supported` before homologation evidence.
- Re-exporting everything via `export *` instead of named exports.

# Effect-native DFeKit

Use this skill when changing Effect-based internals, reviewing an Effect v4 migration, touching `Effect`, `Schema`, `Context`, `Layer`, retry, observability, configuration, or typed error handling in this repository.

## Goal

Keep DFeKit genuinely Effect-native, not just dependency-migrated.

## Required checks

Before claiming a change is complete, run the smallest relevant validation, usually from the repo root:

```bash
bun run check:declarative-errors
bun run check
```

For scoped work, prefer Nx targets:

```bash
nx run @dfe-kit/adapter-saatri:typecheck
nx run @dfe-kit/adapter-saatri:test
nx run @dfe-kit/adapter-saatri:build
```

## Effect-native rules

- Public APIs return typed `Effect.Effect` values.
- Fiscal rejection is business success, not technical failure.
- Recoverable technical faults stay in the typed Effect error channel.
- Use `Context.Service` + `Layer` for services and dependencies.
- Do not hide requirements with `Effect.provide` deep inside library code.
  - `Effect.provide` is allowed in tests, application/runtime boundaries, or very small convenience factories with an explicit local boundary comment.
  - Prefer exporting layers so consumers can substitute HTTP, config, clock, logger, or test services.
- Runtime timeout/retry policy should use `Duration` and `Schedule`.
- Retry must be classified; never retry every failure blindly.
- Secrets must stay `Redacted` until the explicit serialization boundary.
- Event sinks should be Effect-native: `(event) => Effect.Effect<void, never>` or a service/layer.

## Error rules

- Use adapter-native typed errors from the adapter `config.ts`, usually `Schema.TaggedErrorClass` + `Schema.Literals`.
- Construct tagged errors at the decision point.
- Do not create generic helper wrappers like `makeProviderError`, `parseFailure`, or `responseShapeFailure`.
- Do not use `String(error)` / `String(reason)` as the only preserved error data.
- Preserve safe structured origin metadata when converting at a boundary:
  - `operation`
  - `phase`
  - `schemaName`
  - `issuePath`
  - `issueMessage`
  - `upstreamTag`
  - `upstreamCode`
  - HTTP `status` when available
- Do not branch on unknown caught error shapes unless a real provider contract requires it.

## Schema rules

- Prefer `Schema` as the source of truth for data/config contracts.
- Derive exported types from schemas.
- Use `Schema.Literals([...])` for literal catalogs.
- Use brands/codecs/transformations for stable fiscal primitives when the API is ready.
- Avoid manual interfaces for config/data contracts when `Schema` can derive the type.

## Red flags to search for

```bash
rg -n "Context\.(Reference|Tag|GenericTag)|Effect\.(Tag|Service)" core adapters packages
rg -n "Effect\.provide" core adapters packages
rg -n "String\((error|reason|cause|err|e)\)" core adapters packages
rg -n "throw new Error|instanceof Error|runSync|runPromise|runFork" core adapters packages
rg -n "password|secret|token|certificate|privateKey|Redacted" core adapters packages
```

## Done means

- Validation was actually run and reported.
- Static checks cover the pattern being introduced.
- Library internals remain substitutable via services/layers.
- Error conversion preserves enough structured context for debugging.
- No claim of “Effect-native” is made while warnings, hidden `provide`, erased error origins, or untested retry policies remain.

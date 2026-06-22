# DFeKit static checks

Use this skill when editing `tooling/static-checks/check-declarative-errors.ts`, changing repo conventions, or introducing patterns that should be enforced automatically.

## Purpose

The static checker is a guardrail against regressions in DFeKit's Effect-native style. It should catch architectural smells before review.

## Current checker command

```bash
bun run check:declarative-errors
```

Full repo validation:

```bash
bun run check
```

## Patterns the checker should guard

- No legacy result wrappers or dependency imports: `better-result`, `evlog`, `zod`, `ky`.
- No `runSync` / `runPromise` / `runFork` in library internals.
- No `Schema.decodeUnknownSync` in library internals.
- No `as` casts, including `as const`; prefer Schema validation/derivation.
- No runtime exception patterns: `throw new Error`, `instanceof Error`, provider-level `try/catch`.
- No manual exported contracts when `Schema` can derive the type.
- Literal domain catalogs should use `Schema.Literals([...])`.
- No legacy Effect service APIs: `Context.Tag`, `Context.GenericTag`, `Effect.Tag`, `Effect.Service`.
- `Context.Reference` is only acceptable for real references/default values, not normal services.
- No hidden `Effect.provide` in library code.
- No `String(error)` / `String(reason)` as sole preserved error data.
- No direct unsafe callback/event sink calls.
- Secret-like config must use `Redacted` internally.

## Boundary comments

If a pattern is allowed only at a boundary, the allow marker must be narrow.

Bad:

```ts
source.includes("effect-boundary")
```

This allows an entire file after one comment and creates false negatives.

Better:

- allow only the same line or immediately preceding line;
- require a reason;
- keep a fixture that proves a distant forbidden usage still fails.

Example marker:

```ts
// effect-boundary: public convenience factory closes default runtime transport.
Effect.provide(DefaultLayer)
```

## Test discipline

When adding a new check:

1. Add or document a negative example that should fail.
2. Run `bun run check:declarative-errors` before and after the implementation if practical.
3. Ensure tests/docs/dist files are not accidentally blocking normal examples.
4. Avoid regexes that scan the whole source when the rule is line/block-scoped.

## Review checklist

Before approving a checker change:

- Does it catch the target smell in real files?
- Does it avoid obvious false negatives from comments/imports/strings?
- Does it avoid excessive false positives in README/tests/generated files?
- Is the failure message actionable and aligned with AGENTS.md?

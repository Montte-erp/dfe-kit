# DFeKit Agent Guidelines

DFeKit is source-available fiscal infrastructure for Brazilian electronic invoices.

## Language and naming

- User-facing text must be Brazilian Portuguese.
- Code identifiers, variables, properties, file names, and public API names must be English only. Do not mix Portuguese and English in the same code surface.
- Keep APIs boring, typed, explicit, and KISS. Prefer one clear config schema over clever wrapper layers.

## Error taste

- Public APIs return typed `Result` values from `better-result`.
- Fiscal rejection is not a technical exception. Return `Result.ok` with a rejected fiscal status and fiscal rejection data.
- Recoverable technical faults are typed `Result.err` data.
- Mandatory invariants must hard-fail with `panic` from `better-result`. Do not silently fallback for required configuration or impossible states.
- Optional behavior may emit a warning/lifecycle event through evlog/event sinks, but must not hide missing mandatory data.
- Error definitions are declarative: use evlog `defineErrorCatalog` entries in `config.ts` and build typed `Result.err({ code, message, retryable })` objects at the exact decision point.
- Do not create ad-hoc error/failure helper functions such as `parseFailure()`, `responseShapeFailure()`, `makeProviderError()`, or typed helpers returning `FiscalProviderError`.
- Do not use `instanceof Error`, `throw new Error`, `HTTPError`/`TimeoutError` branches, provider-level `try/catch`, or runtime error wrapper classes.
- Promise/IO adaptation may use `Result.tryPromise` with inline `catch: () => ({ ... })` data. Keep catch handlers declarative and never branch on caught error shapes unless a real provider contract requires it.

## Architecture taste

- No barrel files that only re-export. Entry points must provide real package configuration or meaningful public API.
- Avoid `types.ts`. Keep schemas, `z.infer` types, provider config, and evlog catalogs together in `config.ts` when they belong to the same adapter/package.
- Generic validation and boring primitives live in `core/utils`.
- XML primitives live in `core/xml`.
- Date handling uses `dayjs`.
- `core/*` is for reusable core building blocks only. Do not create a generic `core/core` registry/framework layer unless a real use case earns it.
- Adapter packages expose a package configuration function so municipal providers can declare endpoints, city code, and capabilities from the adapter in one type-safe place.
- Prefer top-level exports that are constants, schemas, config functions, or pure factories. Avoid top-level instantiated provider wrappers that pull networking/parsing dependencies into consumers that only import metadata.

## Package and tree-shaking taste

- Packages are ESM-only and should expose explicit `exports` with the `import` condition.
- Every package should declare `"sideEffects": false` unless it truly has module-load side effects.
- Avoid `export *` barrels. Re-export named values/types explicitly from meaningful entry points.
- Keep public provider package metadata tree-shakeable: importing a manifest should not instantiate HTTP clients, XML parsers, or configured provider wrappers.
- Published provider packages should inline private `@dfe-kit/*` core/adapter code through bunup `noExternal`/`dts.resolve`, but keep external public runtime dependencies explicit.

## Fiscal rules

- Preserve raw XML, protocol, provider response, request metadata, and document lifecycle events.
- Do not fake provider support. If homologation has not proven a flow, encode it as unsupported or `unverified_in_homologation` capability metadata.
- XML signing is an injectable `signer` hook, off by default. Certificate handling lives outside DFeKit.
- Generic primitives move to `@f-o-t/*` only after the API is stable and has at least two real consumers.

## Packages

```text
core/fiscal               @dfe-kit/fiscal            fiscal adapter contract + zod schemas
core/utils                @dfe-kit/utils             generic CPF/CNPJ and validation primitives
core/xml                  @dfe-kit/xml               generic XML escaping/encoding primitives
adapters/saatri           @dfe-kit/adapter-saatri    reusable SAATRI/ABRASF 2.03 adapter engine
packages/jacobina-saatri  @dfe-kit/jacobina-saatri   Jacobina-BA provider package
```

Provider packages live in `packages/*` and are the only intended published artifacts. Core and adapter packages are private and inlined into published provider bundles.

## Tooling and Nx

- Follow the tooling-layer pattern: shared TypeScript config under `tooling/typescript`, shared bunup config under `tooling/bunup`, static checks under `tooling/static-checks`, and oxc/oxfmt config under `tooling/oxc`.
- Use Nx targets (`build`, `typecheck`, `test`, `publint`, `check`) instead of one-off root commands when possible.
- CI should use `nx affected` with Bun and Nx cache.

## Validation

```bash
bun install
bun run check
bun run publint
```

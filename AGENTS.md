# Diretrizes do Agente DFeKit

DFeKit é infraestrutura de origem pública para documentos fiscais eletrônicos brasileiros.

## Skills locais de agente

Skills específicas do projeto ficam em `.agents/skills/`. Leia o `SKILL.md` relevante antes de trabalho substancial nestas áreas:

- `.agents/skills/effect-native-dfekit/SKILL.md` — use ao tocar em `Effect`, `Schema`, `Context`, `Layer`, retry, observability, config, erros tipados ou revisão de migração Effect v4.
- `.agents/skills/dfe-kit-static-checks/SKILL.md` — use ao editar `tooling/static-checks/check-declarative-errors.ts` ou adicionar/remover convenções automatizadas do repositório.
- `.agents/skills/dfe-kit-provider-package/SKILL.md` — use ao mudar adapters/provider packages, contratos fiscais, capacidades de provider, entry points, bunup/DTS ou API voltada à publicação.

Essas skills locais complementam este AGENTS.md. Se uma skill local e este arquivo divergirem, siga a regra mais restritiva e atualize ambos no mesmo change.

## Language and naming

- User-facing text must be Brazilian Portuguese.
- Code identifiers, variables, properties, file names, and public API names must be English only. Do not mix Portuguese and English in the same code surface.
- Keep APIs boring, typed, explicit, and KISS. Prefer one clear config schema over clever wrapper layers.

## Error taste

- Public APIs return typed `Effect.Effect` values from `effect`.
- Fiscal rejection is not a technical exception. Return an Effect success with a rejected fiscal status and fiscal rejection data.
- Recoverable technical faults are typed Effect failures.
- For SAATRI adapters, technical failures use `SaatriProviderError` (`Schema.TaggedErrorClass` + `Schema.Literals([...])`) from `adapters/saatri/src/config.ts`.
- Error definitions must live in adapter config modules and be used directly by providers; avoid adapter-local helper constructors or legacy result/failure wrappers.
- XML signer hooks must be Effect-native and return `Effect.Effect<signedXml, SaatriProviderError>` (or equivalent) instead of plain strings or promises.
- Mandatory invariants must hard-fail with Effect defects or schema decode failures. Do not silently fallback for required configuration or impossible states.
- Optional behavior may emit a warning/lifecycle event through event sinks, but must not hide missing mandatory data.
- Error definitions are native Effect errors: use `Schema.TaggedErrorClass` with a literal code catalog in `config.ts`, and construct the tagged error at the exact decision point.
- Do not create ad-hoc error/failure helper functions such as `parseFailure()`, `responseShapeFailure()`, or `makeProviderError()`.
- Do not use `instanceof Error`, `throw new Error`, provider-level `try/catch`, or runtime error wrapper classes.
- Promise/IO adaptation may use `Effect.tryPromise` with inline `catch: () => new TaggedError(...)` data. Keep catch handlers declarative and never branch on caught error shapes unless a real provider contract requires it.

## Alchemy taste

- Alchemy v2 is core infrastructure for deploy-time resources, not an external adapter afterthought.
- Resource constructors are tags: declare them with `Resource<ResourceType>("DFeKit.Name")` and register lifecycle with `Provider.effect(ResourceTag, ...)`.
- Bundle resource providers with `Provider.ProviderCollection` + `Provider.collection([...])`; expose composition as Effect `Layer`s so provider packages can supply `FiscalProviderService`.
- Fiscal document resources are immutable deploy artifacts: default to retain, make reconcile idempotent from Alchemy state, and never pretend deletion cancels a fiscal document.
- Alchemy state remains pluggable. Do not create a DFeKit state store unless a real backend requirement appears; compose with Alchemy's state layer contract instead.

## Architecture taste

- No barrel files that only re-export. Entry points must provide real package configuration or meaningful public API.
- Avoid `types.ts`. Keep schemas, `Schema.TaggedErrorClass` error catalogs, and provider config together in `config.ts` when they belong to the same adapter/package.
- Generic validation should stay local to the domain package until at least two real consumers justify extracting a utility package.
- NFS-e Nacional e catálogos municipais reutilizáveis pertencem a `adapters/nfse`; `packages/*-nfse` ficam finos, por município/portal, sem pacote público agregador monolítico.

## Validation

- Use `bun run check` (or `bun run check:static`) at repository root and per-package `check` targets for typed/shape validation.
- Prefer static checks over ad-hoc review.
  - no `runSync`/`runPromise`/`runFork` in library internals
  - no legacy result/error wrappers
  - no `as` casts, including `as const`; literal catalogs must come from `Schema.Literals([...])`
  - no manual interfaces for config/data contracts when `Schema` can derive the exported type; Effect v4 public schema annotations use `Schema.Codec<T, unknown>` when DTS needs an explicit boundary type
  - no `instanceof`/`throw new Error` patterns
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
core/fiscal                 @dfe-kit/fiscal             fiscal adapter contract + Effect schemas + Alchemy resource tags
core/xml                    @dfe-kit/xml                generic XML escaping/encoding primitives
adapters/saatri             @dfe-kit/adapter-saatri     reusable SAATRI/ABRASF 2.03 adapter engine
adapters/nfse               @dfe-kit/adapter-nfse       reusable NFS-e Nacional + municipal catalog adapter engine
packages/provider-saatri    @dfe-kit/provider-saatri    SAATRI discovery/catalog helpers
packages/provider-sefaz     @dfe-kit/provider-sefaz     generic SEFAZ NF-e/NFC-e base provider
packages/*-saatri           @dfe-kit/*-saatri           one provider package per SAATRI municipality
packages/*-nfse             @dfe-kit/*-nfse             one provider package per municipal NFS-e portal
packages/sefaz-*            @dfe-kit/sefaz-*            one provider package per SEFAZ state
```

Provider packages live in `packages/*` and are the only intended published artifacts. Core and adapter packages are private and inlined into published provider bundles.

## Tooling and Nx

- Follow the tooling-layer pattern: shared TypeScript config under `tooling/typescript`, shared bunup config under `tooling/bunup`, static checks under `tooling/static-checks`, and oxc/oxfmt config under `tooling/oxc`.
- Use Nx targets (`build`, `typecheck`, `test`, `publint`, `check`) instead of one-off root commands when possible.
- CI should use `nx affected` with Bun and Nx cache.
## Commands

- Use `bun run check` (or `bun run check:static`) from repository root for repository checks.
- Use `nx` targets where possible: `build`, `typecheck`, `test`, `publint`, `check`.
- Tests and property checks for Effect workflows should be authored with `@effect/vitest` and validated via `@effect/vitest/static` direction.
- Bibliotecas de compatibilidade e wrappers legados de erro/retenção de resultado estão fora do stack público.
- Keep commands scoped to packages where possible; prefer `nx` targets over one-off scripts.

Script examples:

```bash
bun install
bun run check
bun run publint
```

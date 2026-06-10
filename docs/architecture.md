# Architecture

DFeKit is split by product boundary, not by transport detail.

## Layout

```text
core/fiscal               @dfekit/fiscal            fiscal adapter contract + domain types + zod schemas
core/utils                @dfekit/utils             generic validation primitives
core/xml                  @dfekit/xml               XML escaping/encoding primitives
adapters/saatri           @dfekit/adapter-saatri    reusable SAATRI/ABRASF 2.03 adapter engine
packages/jacobina-saatri  @dfekit/jacobina-saatri   SAATRI Jacobina-BA NFS-e provider
```

`core/*` holds everything essential to the repo. Provider packages live in `packages/*` and are the only published artifacts; core packages are private and inlined into provider bundles at build time (`noExternal` + `dts.resolve`).

## @dfekit/fiscal — the adapter

The unified interface every provider package implements:

- fiscal document kinds: NF-e, NFC-e, NFS-e
- fiscal environments: homologation, production
- document lifecycle statuses
- typed parties, addresses, service items, artifacts, rejections, and provider responses
- the `FiscalProvider` adapter (`manifest` + `issue()`)
- zod schemas under the `@dfekit/fiscal/schemas` subpath (no barrel)

Fiscal rejection is represented inside `ProviderResponse.rejections` with status `rejected`. It is not a thrown technical failure. `Result.err(FiscalProviderError)` is reserved for technical faults (transport, parse, signing).

## Core primitives

There is no `core/core` runtime registry. Core packages must earn their keep as reusable primitives only:

- `@dfekit/fiscal`: fiscal contract and schemas;
- `@dfekit/utils`: boring validation helpers such as CPF/CNPJ;
- `@dfekit/xml`: generic XML encoding/escaping.

## Providers

Provider packages expose metadata, schemas, protocol constants, XML builders, response parsers, and provider implementations only after homologation proves the flow.

The first provider is `@dfekit/jacobina-saatri`: Jacobina/BA using ABRASF 2.03 over SOAP 1.1 with `wsse:UsernameToken`. It is configured through the reusable `@dfekit/adapter-saatri` package function, including endpoints, city code, and capability metadata. Emission is cert-free by default; XML signing is an injectable `signer` hook, off by default.

## Error model

`better-result` is the single Result surface. Public APIs return `Result<T, FiscalProviderError>`:

- transport faults (HTTP non-2xx, timeout, network) are converted to `Result.err` at a single boundary in the provider's HTTP layer, marked `retryable`
- fiscal rejection is `Result.ok` with status `rejected` and `rejections[]`
- raw request/response XML is always preserved in `artifacts`

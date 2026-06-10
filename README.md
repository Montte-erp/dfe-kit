# DFeKit

Source-available fiscal infrastructure for Brazilian electronic invoices.

DFeKit starts with NFS-e through SAATRI/ABRASF 2.03 and is shaped to grow into NF-e, NFC-e, NFS-e Nacional, SEFAZ events, provider adapters, and auditable fiscal document lifecycles.

## Licença

DFeKit é source-available sob a Business Source License 1.1 (`BUSL-1.1`). A licença pública permite desenvolvimento, testes, avaliação, revisão de segurança, modificação e uso não produtivo.

Uso em produção ou uso comercial por terceiros exige uma licença separada da Montte. A Montte, como licenciante, pode usar, distribuir e sublicenciar o DFeKit conforme seus próprios contratos.

Na data de mudança indicada no [`LICENSE`](./LICENSE), o código passa para Apache License 2.0. Em caso de conflito, prevalece o arquivo [`LICENSE`](./LICENSE) ou o contrato comercial assinado com a Montte.

## Packages

```text
@dfe-kit/fiscal            fiscal adapter contract, domain types, zod schemas
@dfe-kit/utils             generic validation primitives (CPF/CNPJ)
@dfe-kit/xml               XML escaping/encoding primitives
@dfe-kit/adapter-saatri    reusable SAATRI/ABRASF 2.03 adapter engine
@dfe-kit/jacobina-saatri   SAATRI Jacobina-BA NFS-e provider (ABRASF 2.03)
```

Planned packages:

```text
@dfe-kit/provider-sefaz    NF-e/NFC-e SEFAZ adapter
@dfe-kit/provider-nfse     NFS-e Nacional adapter
@dfe-kit/cli               local validation and homologation runner
```

## Boundaries

- DFeKit owns fiscal document semantics, provider adapters, state transitions, rejection mapping, and fiscal artifacts.
- XML signing is an injectable hook (`signer`), off by default. DFeKit does not own certificate handling.
- Generic XML, SOAP, mTLS, CPF/CNPJ, and hashing primitives may move to `@f-o-t/*` after two real consumers exist.

## First target

Jacobina/BA NFS-e through SAATRI:

- ABRASF 2.03 payloads
- SOAP 1.1
- `wsse:UsernameToken`
- `GerarNfse`
- `ConsultarNfsePorRps`
- cancellation and substitution only after homologation proves the supported flow

## Public API shape

Public package APIs return typed results (`better-result`): typed input, typed output, typed errors. No exceptions for fiscal rejection; no extra runtime required by callers.

# DFeKit docs site — GROUNDING (real facts, use verbatim; do NOT invent)

Language: **pt-BR**. Theme: olive/green, dark default. Fonts: Plus Jakarta Sans (sans+heading), Lora (serif), IBM Plex Mono (mono). radius 1.4rem.

## Real packages (verified in monorepo)
- Core: `@dfe-kit/fiscal` (Effect contracts/schemas/manifest), `@dfe-kit/xml` (XML primitives).
- Adapters (private, inlined): `adapter-saatri`, `adapter-nfse`, `adapter-sefaz`.
- NFS-e municipal SAATRI (Bahia), 11 municípios: amargosa, boavista, ipira, itaberaba, **jacobina**, morro-do-chapeu, pojuca, sao-desiderio, sao-francisco-do-conde, sento-se, serra-do-ramalho → `@dfe-kit/<cidade>-saatri`.
- NFS-e municipal: `@dfe-kit/juiz-de-fora-nfse` (Juiz de Fora-MG, ABRASF 2.02).
- Catálogo SAATRI publicado: `@dfe-kit/provider-saatri`. Não existe fachada pública agregadora para NFS-e.
- SEFAZ NF-e/NFC-e (modelos 55/65), **todas as 27 UFs**: `@dfe-kit/sefaz-<uf>` (ac al am ap ba ce df es go ma mg ms mt pa pb pe pi pr rj rn ro rr rs sc se sp to).

## HONEST stats (only these; frame as "packages publicados/mapeados", not "homologados")
- **12 municípios** NFS-e (11 SAATRI-BA + Juiz de Fora-MG)
- **27 UFs** SEFAZ NF-e/NFC-e (metadata-first / unverified)
- **ABRASF 2.03** (SAATRI), **55/65** (NF-e/NFC-e), **Effect v4** (4.0.0-beta.81), **Apache-2.0**
- DO NOT claim adoption, stars, users, downloads, "trusted by". None exist.

## Real API (use verbatim in code samples)
```ts
// factory (server-side only)
import { createJacobinaSaatriProvider } from "@dfe-kit/jacobina-saatri"
const provider = createJacobinaSaatriProvider(credentials /* SaatriCredentials: usuario/senha + inscrição municipal */, {
  environment: "homologation", // "homologation" | "production"
  signer,                      // optional GerarNfseSigner (XML assinado fica fora do DFeKit)
})

// contract
type FiscalProvider = {
  readonly manifest: FiscalProviderManifest
  issue(input: IssueFiscalDocumentInput): Effect.Effect<IssueFiscalDocumentResponse, FiscalProviderError>
}
// IssueFiscalDocumentInput = { environment, documentKind, issuer, customer, services?, products?, series, number, issuedAt }
//   NFS-e exige services[]; NF-e/NFC-e exigem products[].
// IssueFiscalDocumentResponse = { documentRef, providerResponse }
// FiscalProviderError = { code: string, retryable: boolean, message: string }
```

## Capability model (THE differentiator — auditable)
Status: `supported` | `unsupported` | `unverified_in_homologation`. 13 capabilities:
issue_nfse, submit_rps_batch, submit_rps_batch_sync, query_rps_batch, query_nfse_by_rps, generate_nfse, query_issued_nfse, query_received_nfse, query_nfse_range, cancel_nfse, replace_nfse, issue_nfe, issue_nfce.

### Real Jacobina manifest (use for the capabilities Table — HONEST)
| capability | status | nota |
|---|---|---|
| issue_nfse | supported | GerarNfse ABRASF 2.03 |
| generate_nfse | supported | equivalente a issue_nfse |
| query_nfse_by_rps | unverified_in_homologation | mapeado, sem prova |
| submit_rps_batch | unverified_in_homologation | lote RPS |
| submit_rps_batch_sync | unverified_in_homologation | lote síncrono |
| query_rps_batch | unverified_in_homologation | consulta lote |
| query_issued_nfse | unverified_in_homologation | NFS-e prestadas |
| query_received_nfse | unverified_in_homologation | NFS-e tomadas |
| query_nfse_range | unverified_in_homologation | por faixa |
| cancel_nfse | unverified_in_homologation | requer certificado fora do DFeKit |
| replace_nfse | unverified_in_homologation | requer certificado fora do DFeKit |
| issue_nfe | unsupported | SAATRI é municipal NFS-e, não NF-e 55 |
| issue_nfce | unsupported | não NFC-e 65 |

## Core guarantees (honest selling points)
- Toda operação fiscal retorna `Effect.Effect` com input/output/erros tipados.
- Rejeição fiscal = resultado de negócio (status rejected), NÃO erro lançado. Falha técnica vai no canal de erro tipado (`retryable`).
- Certificado ICP-Brasil, mTLS e XML assinado ficam FORA do DFeKit (hooks Effect-native na borda server-side).
- Homologação primeiro: documento fiscal é irreversível. Só marque `supported` após provar o fluxo real com o contribuinte.
- Um package por alvo fiscal (município/UF) — a app instala só o que usa. Sem package único inflado.

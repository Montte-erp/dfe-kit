# DFeKit

Infraestrutura open-source para documentos fiscais eletrônicos brasileiros.

O DFeKit começa com NFS-e municipal via SAATRI/ABRASF 2.03 e NFS-e Nacional via Sefin Nacional, e segue evoluindo para NF-e, NFC-e, eventos de SEFAZ, adaptadores de prefeitura e trilhas auditáveis de documentos fiscais.

## Docs

```bash
bun run docs:dev
bun run docs:build
```

O site em Astro fica em `apps/docs/` e reúne landing page, instalação, quickstart, providers, capabilities, NFS-e, prefeituras e SEFAZ por UF.

## Licença

O DFeKit é distribuído sob a **Apache License 2.0 (`Apache-2.0`)**.

Veja o arquivo [`LICENSE`](./LICENSE).

## Pacotes

```text
@dfe-kit/fiscal                 contrato fiscal, tipos de domínio e schemas do Effect
@dfe-kit/xml                    primitivas de escape/encoding XML
@dfe-kit/adapter-saatri         motor SAATRI/ABRASF 2.03 reutilizável
@dfe-kit/adapter-sefaz          motor SEFAZ NF-e/NFC-e Effect-native reutilizável
@dfe-kit/adapter-nfse          motor NFS-e Nacional + catálogo municipal reutilizável
@dfe-kit/provider-saatri        catálogo SAATRI para descoberta e geração de packages
@dfe-kit/<municipio>-saatri     um package por prefeitura SAATRI
@dfe-kit/juiz-de-fora-nfse      package municipal NFS-e Juiz de Fora-MG
@dfe-kit/sefaz-<uf>             um package por estado para NF-e/NFC-e
```

Pacotes planejados:

```text
@dfe-kit/cli               validador local e runner de homologação
```

## Limites de responsabilidade

- O DFeKit define semântica fiscal, contratos de provider, transições de estado, mapeamento de rejeições e artefatos fiscais.
- O XML firmado é um _hook_ injetável (`signer`), desativado por padrão. O DFeKit não possui manejo de certificados.
- Nos providers NFS-e Nacional e SEFAZ, o XML assinado entra por hook Effect-native; mTLS/certificado continua fora do DFeKit e é injetado no cliente HTTP.
- Primitivas genéricas de XML, SOAP, mTLS, CPF/CNPJ e hash só devem sair para pacote próprio após API estável e pelo menos dois consumidores reais.

## Alvos por município e estado

A regra de publicação é explícita: um package por município e um package por UF. Código compartilhado fica em adapters privados (`adapter-saatri`, `adapter-nfse`, `adapter-sefaz`) e é inlinado nos packages publicados; sem façade pública agregadora para NFS-e.

```text
@dfe-kit/jacobina-saatri                    Jacobina-BA                 2917508
@dfe-kit/boavista-saatri                    Boa Vista-RR                1400100
@dfe-kit/itaberaba-saatri                   Itaberaba-BA                2914703
@dfe-kit/ipira-saatri                       Ipirá-BA                    2914000
@dfe-kit/sao-francisco-do-conde-saatri      São Francisco do Conde-BA   2929206
@dfe-kit/pojuca-saatri                      Pojuca-BA                   2925204
@dfe-kit/sao-desiderio-saatri               São Desidério-BA            2928901
@dfe-kit/amargosa-saatri                    Amargosa-BA                 2901007
@dfe-kit/sento-se-saatri                    Sento Sé-BA                 2930204
@dfe-kit/serra-do-ramalho-saatri            Serra do Ramalho-BA         2930154
@dfe-kit/morro-do-chapeu-saatri             Morro do Chapéu-BA          2921708
@dfe-kit/juiz-de-fora-nfse                  Juiz de Fora-MG             3136702
@dfe-kit/sefaz-ac .. @dfe-kit/sefaz-to      NF-e/NFC-e por UF           modelos 55/65
```

Juiz de Fora usa emissor municipal próprio ABRASF 2.02. O package lista endpoints, WSDL e capabilities; emissão exige XML assinado, certificado ICP-Brasil/mTLS fora do DFeKit e homologação do contribuinte antes de marcar `issue_nfse` como `supported`.

Os packages estaduais `@dfe-kit/sefaz-<uf>` e o package municipal `@dfe-kit/juiz-de-fora-nfse` são metadata-first: expõem apenas `.` enquanto não houver runtime homologado próprio. Estados SEFAZ constroem manifests pelo catálogo privado de `@dfe-kit/adapter-sefaz`; municípios NFS-e sem runtime próprio constroem manifests pelo catálogo privado de `@dfe-kit/adapter-nfse`.

## Forma da API pública (Effect-first)

As APIs públicas retornam valores de `Effect.Effect` com entrada, saída e falhas tipadas.

- Falhas técnicas são expostas no canal de erro via classes tipadas de `Schema.TaggedErrorClass` do provider/adapter (`SaatriProviderError`, `NfseNacionalProviderError`, `SefazProviderError`).
- Rejeição fiscal não é exceção técnica: ela permanece como sucesso do Effect com `providerResponse.status === "rejected"` e detalhes de rejeição em `providerResponse.rejections`.
- Runtimes Effect e Alchemy v2 consomem `FiscalProviderService` via `Layer`; os providers expõem factories de Layer sem criar recursos de infra nem manejar certificado dentro do DFeKit.
- Não há wrappers legados de resultado no contrato público.

### Exemplo de borda da aplicação

```ts
import { Effect } from "effect";
import { createJacobinaSaatriProvider } from "@dfe-kit/jacobina-saatri";

const provider = createJacobinaSaatriProvider({ ...credentials }, { environment: "homologation" });
const issued = await Effect.runPromise(provider.issue({ ...input }));
```

`provider.issue(...)` retorna `Effect.Effect<... , SaatriProviderError>`, com falhas técnicas tipadas e rejeição fiscal como sucesso de negócio.

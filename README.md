# DFeKit

Infraestrutura open-source para documentos fiscais eletrônicos brasileiros.

O DFeKit começa com NFS-e via SAATRI/ABRASF 2.03 e segue evoluindo para NF-e, NFC-e, NFS-e Nacional, eventos de SEFAZ, adaptadores de prefeitura e trilhas auditáveis de documentos fiscais.

## Licença

DFeKit é source-available sob a Business Source License 1.1 (`BUSL-1.1`). A licença pública permite desenvolvimento, testes, avaliação, revisão de segurança, modificação e uso não produtivo.

Uso em produção ou uso comercial por terceiros exige uma licença separada da Montte. A Montte, como licenciante, pode usar, distribuir e sublicenciar o DFeKit conforme seus próprios contratos.

Na data de mudança indicada no [`LICENSE`](./LICENSE), o código passa para Apache License 2.0. Em caso de conflito, prevalece o arquivo [`LICENSE`](./LICENSE) ou o contrato comercial assinado com a Montte.

## Pacotes

```text
@dfe-kit/fiscal            contrato fiscal, tipos de domínio e schemas do Effect
@dfe-kit/xml               primitivas de escape/encoding XML
@dfe-kit/adapter-saatri    motor de adaptação SAATRI/ABRASF 2.03 reutilizável
@dfe-kit/jacobina-saatri   provedor SAATRI de NFS-e Jacobina-BA (ABRASF 2.03)
```

Pacotes planejados:

```text
@dfe-kit/provider-sefaz    adaptador SEFAZ para NF-e/NFC-e
@dfe-kit/provider-nfse     adaptador para NFS-e Nacional
@dfe-kit/cli               validador local e runner de homologação
```

## Limites de responsabilidade

- O DFeKit define semântica fiscal, contratos de provider, transições de estado, mapeamento de rejeições e artefatos fiscais.
- O XML firmado é um _hook_ injetável (`signer`), desativado por padrão. O DFeKit não possui manejo de certificados.
- Primitivas genéricas de XML, SOAP, mTLS, CPF/CNPJ e hash só devem sair para pacote próprio após API estável e pelo menos dois consumidores reais.

## Primeiro alvo

Jacobina/BA NFS-e via SAATRI:

- payloads ABRASF 2.03
- SOAP 1.1
- `wsse:UsernameToken`
- `GerarNfse`
- `ConsultarNfsePorRps`
- cancelamento e substituição apenas após comprovação em homologação

## Forma da API pública (Effect-first)

As APIs públicas retornam valores de `Effect.Effect` com entrada, saída e falhas tipadas.

- Falhas técnicas são expostas no canal de erro via classes tipadas de `Schema.TaggedErrorClass` do próprio adapter (`SaatriProviderError` em `@dfe-kit/adapter-saatri`).
- Rejeição fiscal não é exceção técnica: ela permanece como sucesso do Effect com `providerResponse.status === "rejected"` e detalhes de rejeição em `providerResponse.rejections`.
- Não há wrappers legados de resultado no contrato público.
### Exemplo de borda da aplicação

```ts
import { Effect } from "effect";
import { createJacobinaSaatriProvider } from "@dfe-kit/jacobina-saatri/runtime";

const provider = createJacobinaSaatriProvider({ ...credentials }, { environment: "homologation" });
const issued = await Effect.runPromise(provider.issue({ ...input }));
```

`provider.issue(...)` retorna `Effect.Effect<... , SaatriProviderError>`, com falhas técnicas tipadas e rejeição fiscal como sucesso de negócio.

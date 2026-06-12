# @dfe-kit/jacobina-saatri

Provider NFS-e para **Jacobina/BA** via **SAATRI / ABRASF 2.03**.

Este pacote é parte do DFeKit: infraestrutura fiscal open source para documentos fiscais eletrônicos brasileiros.

## Status

**Experimental / homologação primeiro.**

Capacidade declarada hoje:

- `issue_nfse`: geração de NFS-e/RPS via operação SAATRI `GerarNfse`.

O `manifest.capabilityMetadata` também cataloga serviços do manual como `unverified_in_homologation` quando ainda não há prova automatizada. Não trate esses itens como suporte operacional.

Atenção 2026: `GerarNfse` e `ConsultaNfsePorRps` podem se comportar de forma assíncrona por compartilhamento com o ambiente nacional; respostas como “DPS gerada/compartilhada” viram `accepted_pending_authorization` e exigem consulta posterior.

Ainda **não** declare suporte produtivo amplo para:

- consulta por RPS;
- cancelamento;
- substituição;
- lote;
- consultas prestadas/tomadas/faixa;
- NFS-e Nacional direta;
- assinatura XML obrigatória;
- qualquer outro município.

Essas capacidades só devem aparecer no `manifest` depois de prova em homologação com fixtures e testes automatizados.

## Licença

Este pacote é distribuído sob **Apache License 2.0 (`Apache-2.0`)**.

A licença permite uso, cópia, modificação, distribuição, sublicenciamento e uso comercial conforme os termos da Apache 2.0.

Veja o arquivo [`LICENSE`](../../LICENSE).

## Instalação

```bash
bun add @dfe-kit/jacobina-saatri effect
```

Ou com npm:

```bash
npm install @dfe-kit/jacobina-saatri effect
```

> `effect` faz parte do contrato público: `provider.issue(...)` e outros métodos fiscais
> retornam `Effect.Effect<T, SaatriProviderError>`, ou seja, falhas técnicas tipadas no
> canal de erro. Rejeição fiscal continua como sucesso de negócio (`providerResponse.status`).

Sem wrappers de retorno legados.

```ts
import { Effect } from "effect";
import {
  createJacobinaSaatriProvider,
  type SaatriProviderError,
} from "@dfe-kit/jacobina-saatri/runtime";

const provider = createJacobinaSaatriProvider(
  {
    username: process.env.SAATRI_USERNAME!,
    password: process.env.SAATRI_PASSWORD!,
    issuerCnpj: process.env.SAATRI_ISSUER_CNPJ!,
    municipalRegistration: process.env.SAATRI_MUNICIPAL_REGISTRATION!,
  },
  {
    environment: "homologation",
  },
);

const issued = await Effect.runPromise(
  provider.issue({
    environment: "homologation",
    documentKind: "nfse",
    series: "1",
    number: "1",
    issuedAt: new Date().toISOString(),
    issuer: {
      legalName: "Empresa Prestadora LTDA",
      cnpj: "00000000000000",
      municipalRegistration: "12345",
      address: {
        street: "Rua Exemplo",
        number: "100",
        district: "Centro",
        cityCode: "2917706",
        city: "Jacobina",
        state: "BA",
        postalCode: "44700000",
        countryCode: "1058",
      },
    },
    customer: {
      legalName: "Cliente Tomador",
      cpf: "00000000000",
      address: {
        street: "Rua Cliente",
        number: "200",
        district: "Centro",
        cityCode: "2917706",
        city: "Jacobina",
        state: "BA",
        postalCode: "44700000",
        countryCode: "1058",
      },
    },
    services: [
      {
        description: "Serviço de teste em homologação",
        serviceListCode: "01.05",
        amount: "150.00",
        taxable: true,
      },
    ],
  }),
);

const providerResponse = issued.providerResponse;

if (providerResponse.status === "rejected") {
  // Rejeição fiscal: o provedor processou a requisição, mas recusou por regra fiscal.
  console.log(providerResponse.rejections);
} else if (providerResponse.status === "authorized") {
  console.log("NFS-e autorizada", {
    documentRef: issued.documentRef,
    providerDocumentId: providerResponse.providerDocumentId,
    protocol: providerResponse.protocol,
    verificationUrl: providerResponse.verificationUrl,
  });
}
```

## Endpoints SAATRI Jacobina

- homologação: `https://homologa-homologa-jacobina.saatri.com.br/servicos/nfse.svc`
- produção: `https://homologa-jacobina.saatri.com.br/servicos/nfse.svc`
- WSDL: acrescente `?wsdl`
- limite XML informado: 512 KB

## Modelo de erro

DFeKit separa erro técnico de rejeição fiscal.

### Rejeição fiscal

Rejeição fiscal é resposta válida do provedor. Ela volta como sucesso no Effect com:

```ts
providerResponse.status === "rejected";
providerResponse.rejections.length > 0;
```

Exemplos:

- inscrição municipal ausente;
- código de serviço inválido;
- RPS já informado;
- tomador inválido;
- regra municipal descumprida.

### Erro técnico

Erro técnico volta como falha tipada no canal de erro do Effect (`SaatriProviderError`), conforme catálogo de códigos em `@dfe-kit/adapter-saatri/src/config.ts`.

Exemplos:

- timeout;
- falha de rede;
- HTTP não-2xx;
- SOAP Fault técnico;
- XML de resposta irreconhecível;
- falha do hook de assinatura.

## Artefatos fiscais

A resposta preserva XML bruto em `providerResponse.artifacts`.

Hoje o provider salva, no mínimo:

- `request_xml`;
- `response_xml`.

Consumidores devem persistir esses artefatos junto com protocolo, número, código de verificação e eventos de ciclo de vida. Documento fiscal sem XML/protocolo preservado não é auditável.

## Assinatura XML

Assinatura XML é opcional e injetável:

```ts
import { Effect } from "effect";
import type { SaatriProviderError, GerarNfseSigner } from "@dfe-kit/jacobina-saatri";

const signer: GerarNfseSigner = (xmlToSign) => {
  // Assine o XML fora do DFeKit usando seu provedor de certificado/HSM/KMS.
  // `GerarNfseSigner` é Effect-native:
  // - sucesso: Effect.succeed(xmlAssinado)
  // - falha técnica: Effect.fail(new SaatriProviderError({ ... }))
  return Effect.succeed(xmlToSign);
};
```

> `GerarNfseSigner` tem assinatura:
>
> `type GerarNfseSigner = (xmlToSign: string) => Effect.Effect<string, SaatriProviderError>`

## OpenTelemetry opcional

O subpath `@dfe-kit/jacobina-saatri/manifest` não depende de OpenTelemetry e não instancia SDK, exporter, cliente HTTP ou provider configurado. O subpath `@dfe-kit/jacobina-saatri/runtime` expõe as factories de execução.

O adapter SAATRI já emite spans, métricas e logs via `effect`:

- spans: `dfe.saatri.issue`, `dfe.saatri.envelope.build`, `dfe.saatri.sign`, `dfe.saatri.http.post`, `dfe.saatri.response.parse`, `dfe.saatri.xml.parse`;
- métricas: `dfe_saatri_issue_total`, `dfe_saatri_issue_error_total`, `dfe_saatri_fiscal_status_total`, `dfe_saatri_http_attempt_total`, `dfe_saatri_http_status_total`, `dfe_saatri_http_retry_total`, `dfe_saatri_parse_error_total`, `dfe_saatri_xml_bytes`.

Para exportar traces via OpenTelemetry, configure `@effect/opentelemetry` no runtime da aplicação consumidora. Métricas e logs exigem leitores/processadores adicionais no `NodeSdk.layer`; o DFeKit não escolhe exporters, resource ou sampling por você.

```bash
bun add @effect/opentelemetry @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http
```

Exemplo de composição opcional no boundary da aplicação:

```ts
import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect } from "effect";
import { createJacobinaSaatriProvider } from "@dfe-kit/jacobina-saatri/runtime";

const OtelLive = NodeSdk.layer(() => ({
  resource: { serviceName: "my-fiscal-service" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" }),
  ),
}));

const provider = createJacobinaSaatriProvider(credentials, {
  environment: "homologation",
  correlationId: "request-123",
});

const result = await Effect.runPromise(provider.issue(input).pipe(Effect.provide(OtelLive)));
```

Essa decisão mantém OTel configurável e opcional no adapter: DFeKit emite observabilidade nativa do Effect; a aplicação escolhe exporters, resource, leitores de métricas/logs e política de sampling.

## DFeKit não armazena chaves

DFeKit **não** guarda certificado, senha de PFX ou material criptográfico. Certificado A1, vault, HSM e política de segredo ficam fora deste pacote.

## Segurança de produção

Emissão em `production` gera documento fiscal real.

Recomendações para consumidores:

- usar `homologation` por padrão;
- exigir confirmação explícita para produção;
- persistir todos os XMLs e eventos;
- usar idempotência por ambiente + CNPJ + série + número;
- nunca fazer retry automático cego de emissão fiscal;
- esconder credenciais e XMLs sensíveis de logs públicos.

## API pública principal

```ts
createJacobinaSaatriProvider(
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider
```

Credenciais e opções da API schema-first vêm dos tipos exportados pelo pacote:

```ts
import {
  createJacobinaSaatriProvider,
  type SaatriCredentials,
  type CreateSaatriPackageProviderOptions,
} from "@dfe-kit/jacobina-saatri/runtime";

const credentials: SaatriCredentials = {
  username: process.env.SAATRI_USERNAME!,
  password: process.env.SAATRI_PASSWORD!,
  issuerCnpj: process.env.SAATRI_ISSUER_CNPJ!,
  municipalRegistration: process.env.SAATRI_MUNICIPAL_REGISTRATION!,
};

const options: CreateSaatriPackageProviderOptions = {
  environment: "homologation",
};

const provider = createJacobinaSaatriProvider(credentials, options);
```

## Constantes públicas

Imports recomendados:

```ts
import { jacobinaSaatriManifest } from "@dfe-kit/jacobina-saatri/manifest";
import { createJacobinaSaatriProvider } from "@dfe-kit/jacobina-saatri/runtime";
```

O pacote exporta constantes de provider:

- `JACOBINA_CITY_CODE`;
- `SAATRI_ABRASF_VERSION`;
- `SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT`;
- `SAATRI_JACOBINA_PRODUCTION_ENDPOINT`;
- `jacobinaSaatriManifest`.

## Changelog

Veja [`CHANGELOG.md`](./CHANGELOG.md) para mudanças publicáveis deste pacote.

## Desenvolvimento

Asserções e cenários devem permanecer em `@effect/vitest` (incluindo `@effect/vitest/static` para validação estática de contratos).

Na raiz do repositório:

```bash
bun install
bun run check:static
bun run test
bun run typecheck
bun run build
bun run publint
```

Antes de publicar pacote:

```bash
bun run publish:npm:dry
bun run publish:npm
```

O tarball deve incluir apenas:

- `package.json`;
- `LICENSE`;
- `README.md`;
- `dist/index.js`;
- `dist/index.d.ts`;
- `dist/manifest.js`;
- `dist/manifest.d.ts`;
- `dist/runtime.js`;
- `dist/runtime.d.ts`.

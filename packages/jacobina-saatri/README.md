# @montte-erp/jacobina-saatri

Provider NFS-e para **Jacobina/BA** via **SAATRI / ABRASF 2.03**.

Este pacote é parte do DFeKit: infraestrutura fiscal source-available para documentos fiscais eletrônicos brasileiros.

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

DFeKit é **source-available**, não open source.

Este pacote é distribuído sob **Business Source License 1.1 (`BUSL-1.1`)**.

Uso permitido pela licença pública:

- leitura do código;
- avaliação;
- testes;
- desenvolvimento;
- revisão de segurança;
- uso não produtivo.

Uso em produção, uso comercial, revenda, sublicenciamento ou oferta de produto/serviço fiscal semelhante exige licença comercial separada da Montte.

Veja o arquivo [`LICENSE`](./LICENSE).

## Instalação

```bash
bun add @montte-erp/jacobina-saatri better-result
```

Ou com npm:

```bash
npm install @montte-erp/jacobina-saatri better-result
```

> `better-result` faz parte do contrato público: APIs fiscais retornam `Result<T, FiscalProviderError>`.

## Uso mínimo

```ts
import { createJacobinaSaatriProvider } from "@montte-erp/jacobina-saatri";

const provider = createJacobinaSaatriProvider(
  {
    username: process.env.SAATRI_USERNAME!, // CPF do usuário do portal
    password: process.env.SAATRI_PASSWORD!,
    issuerCnpj: process.env.SAATRI_ISSUER_CNPJ!,
    municipalRegistration: process.env.SAATRI_MUNICIPAL_REGISTRATION!,
  },
  {
    environment: "homologation",
  },
);

const result = await provider.issue({
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
});

if (result.isErr()) {
  // Falha técnica: rede, timeout, HTTP não-2xx, parse, assinatura etc.
  console.error(result.error);
  process.exit(1);
}

const issued = result.value;
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

Rejeição fiscal é resposta válida do provedor. Ela volta como `Result.ok` com:

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

Erro técnico volta como `Result.err(FiscalProviderError)`.

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
import {
  createJacobinaSaatriProvider,
  type JacobinaSaatriSigner,
} from "@montte-erp/jacobina-saatri";

const signer: JacobinaSaatriSigner = async (xmlToSign) => {
  // Assine o XML fora do DFeKit usando seu provedor de certificado/HSM/KMS.
  // Retorne Result.ok(xmlAssinado) ou Result.err(FiscalProviderError).
};

const provider = createJacobinaSaatriProvider(credentials, { signer });
```

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

### `createJacobinaSaatriProvider(credentials, opts?)`

Cria um provider fiscal para Jacobina/BA.

```ts
createJacobinaSaatriProvider(
  credentials: JacobinaSaatriCredentials,
  opts: CreateJacobinaSaatriProviderOptions,
): FiscalProvider
```

Credenciais:

```ts
interface JacobinaSaatriCredentials {
  readonly username: string;
  readonly password: string;
  readonly issuerCnpj: string;
  readonly municipalRegistration: string;
}
```

Opções:

```ts
interface CreateJacobinaSaatriProviderOptions {
  readonly environment: "homologation" | "production";
  readonly signer?: JacobinaSaatriSigner;
  readonly timeoutMs?: number;
  readonly eventSink?: JacobinaSaatriEventSink;
}
```

## Constantes públicas

O pacote exporta constantes de provider:

- `JACOBINA_CITY_CODE`;
- `SAATRI_ABRASF_VERSION`;
- `SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT`;
- `SAATRI_JACOBINA_PRODUCTION_ENDPOINT`;
- `jacobinaSaatriManifest`.

## Desenvolvimento

Na raiz do repositório:

```bash
bun install
bun test
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
- `dist/index.d.ts`.

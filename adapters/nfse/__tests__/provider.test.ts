import { describe, expect, it } from "@effect/vitest";
import type { IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { Effect } from "effect";
import { createNfseNacionalProvider } from "../src/index";
import { NfseNacionalProviderErrorCodeValue } from "../src/config";
import type { NfseNacionalHttpClient } from "../src/http";

const input: IssueFiscalDocumentInput = {
  environment: "homologation",
  documentKind: "nfse",
  series: "1",
  number: "42",
  issuedAt: "2026-06-21T00:00:00Z",
  issuer: {
    legalName: "Empresa Prestadora LTDA",
    cnpj: "31847389000139",
    municipalRegistration: "111111",
    address: {
      street: "Rua Teste",
      number: "100",
      district: "Centro",
      cityCode: "3550308",
      city: "São Paulo",
      state: "SP",
      postalCode: "01001000",
      countryCode: "1058",
    },
  },
  customer: {
    legalName: "Cliente Tomador",
    cpf: "72625701374",
    address: {
      street: "Rua Cliente",
      number: "200",
      district: "Centro",
      cityCode: "3304557",
      city: "Rio de Janeiro",
      state: "RJ",
      postalCode: "20040002",
      countryCode: "1058",
    },
  },
  services: [
    {
      description: "Serviço nacional de teste",
      serviceListCode: "01.05",
      nbsCode: "115071200",
      amount: "150.00",
      taxable: true,
    },
  ],
};

describe("createNfseNacionalProvider", () => {
  it.effect("submete DPS XML assinada e preserva artefatos autorizados", () =>
    Effect.gen(function* () {
      let capturedEndpoint = "";
      let capturedXml = "";
      const http: NfseNacionalHttpClient = {
        postDpsXml: ({ endpoint, dpsXml }) => {
          capturedEndpoint = endpoint;
          capturedXml = dpsXml;
          return Effect.succeed({
            status: 200,
            body: "<NFSe><infNFSe><ChaveAcesso>123456789</ChaveAcesso><Protocolo>ABC</Protocolo></infNFSe></NFSe>",
          });
        },
      };
      const provider = createNfseNacionalProvider(http, {
        environment: "homologation",
        buildDpsXml: () => Effect.succeed('<DPS Id="DPS1"><infDPS /></DPS>'),
      });

      const issued = yield* provider.issue(input);

      expect(capturedEndpoint).toBe(
        "https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional/nfse",
      );
      expect(capturedXml).toContain("<DPS");
      expect(issued.providerResponse.status).toBe("authorized");
      expect(issued.providerResponse.providerDocumentId).toBe("123456789");
      expect(issued.providerResponse.protocol).toBe("ABC");
      expect(issued.providerResponse.artifacts.map((artifact) => artifact.kind)).toEqual([
        "request_xml",
        "response_xml",
        "authorized_xml",
      ]);
    }),
  );

  it.effect("representa rejeição fiscal no canal de sucesso", () =>
    Effect.gen(function* () {
      const http: NfseNacionalHttpClient = {
        postDpsXml: () =>
          Effect.succeed({
            status: 200,
            body: "<ListaMensagemRetorno><MensagemRetorno><Codigo>E001</Codigo><Mensagem>Município não conveniado</Mensagem></MensagemRetorno></ListaMensagemRetorno>",
          }),
      };
      const provider = createNfseNacionalProvider(http, {
        environment: "homologation",
        buildDpsXml: () => Effect.succeed('<DPS Id="DPS1"><infDPS /></DPS>'),
      });

      const issued = yield* provider.issue(input);

      expect(issued.providerResponse.status).toBe("rejected");
      expect(issued.providerResponse.rejections.map((rejection) => rejection.code)).toEqual([
        "E001",
      ]);
      expect(issued.providerResponse.rejections.map((rejection) => rejection.message)).toEqual([
        "Município não conveniado",
      ]);
    }),
  );

  it.effect("falha tecnicamente quando buildDpsXml não retorna XML", () =>
    Effect.gen(function* () {
      const http: NfseNacionalHttpClient = {
        postDpsXml: () => Effect.succeed({ status: 200, body: "<NFSe />" }),
      };
      const provider = createNfseNacionalProvider(http, {
        environment: "homologation",
        buildDpsXml: () => Effect.succeed(""),
      });

      const error = yield* Effect.flip(provider.issue(input));

      expect(error.code).toBe(NfseNacionalProviderErrorCodeValue.dpsBuildError);
    }),
  );

  it.effect("falha tecnicamente quando ambiente de entrada diverge do provider", () =>
    Effect.gen(function* () {
      const http: NfseNacionalHttpClient = {
        postDpsXml: () => Effect.succeed({ status: 200, body: "<NFSe />" }),
      };
      const provider = createNfseNacionalProvider(http, {
        environment: "production",
        buildDpsXml: () => Effect.succeed("<DPS />"),
      });

      const error = yield* Effect.flip(provider.issue(input));

      expect(error.code).toBe(NfseNacionalProviderErrorCodeValue.invalidInput);
    }),
  );
});

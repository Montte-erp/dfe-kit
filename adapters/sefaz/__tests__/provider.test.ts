import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService, type IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { Effect, Layer } from "effect";
import {
  createSefazHttpClientLayerFromClient,
  createSefazProvider,
  createSefazProviderLayer,
  SefazProviderErrorCodeValue,
} from "../src/index";
import type { SefazHttpClient } from "../src/index";

const input: IssueFiscalDocumentInput = {
  environment: "homologation",
  documentKind: "nfe",
  series: "1",
  number: "42",
  issuedAt: "2026-06-21T00:00:00Z",
  issuer: {
    legalName: "Empresa Emitente LTDA",
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
    legalName: "Cliente Destinatário",
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
  products: [
    {
      description: "Produto de teste",
      cfop: "5102",
      ncm: "01012100",
      quantity: "1.0000",
      unit: "UN",
      unitAmount: "150.00",
      totalAmount: "150.00",
      taxable: true,
    },
  ],
};

describe("createSefazProvider", () => {
  it.effect("submete XML assinado e preserva autorização", () =>
    Effect.gen(function* () {
      let capturedEndpoint = "";
      let capturedXml = "";
      const http: SefazHttpClient = {
        postAuthorizationXml: ({ endpoint, requestXml }) => {
          capturedEndpoint = endpoint;
          capturedXml = requestXml;
          return Effect.succeed({
            status: 200,
            body: "<retEnviNFe><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo><chNFe>35260631847389000139550010000000421000000420</chNFe><nProt>135260000000001</nProt></retEnviNFe>",
          });
        },
      };
      const provider = createSefazProvider(http, {
        environment: "homologation",
        authorizationEndpoints: { nfe: "https://homologacao.sefaz.example/NFeAutorizacao4" },
        buildSignedRequestXml: () => Effect.succeed("<soap:Envelope><enviNFe /></soap:Envelope>"),
      });

      const issued = yield* provider.issue(input);

      expect(capturedEndpoint).toBe("https://homologacao.sefaz.example/NFeAutorizacao4");
      expect(capturedXml).toContain("<enviNFe");
      expect(issued.providerResponse.status).toBe("authorized");
      expect(issued.providerResponse.providerDocumentId).toBe(
        "35260631847389000139550010000000421000000420",
      );
      expect(issued.providerResponse.protocol).toBe("135260000000001");
      expect(issued.providerResponse.artifacts.map((artifact) => artifact.kind)).toEqual([
        "request_xml",
        "response_xml",
        "authorized_xml",
      ]);
    }),
  );

  it.effect("roteia NFC-e para endpoint NFC-e configurado", () =>
    Effect.gen(function* () {
      let capturedEndpoint = "";
      const http: SefazHttpClient = {
        postAuthorizationXml: ({ endpoint }) => {
          capturedEndpoint = endpoint;
          return Effect.succeed({
            status: 200,
            body: "<retEnviNFe><cStat>100</cStat><xMotivo>Autorizado o uso da NFC-e</xMotivo></retEnviNFe>",
          });
        },
      };
      const provider = createSefazProvider(http, {
        environment: "homologation",
        authorizationEndpoints: {
          nfe: "https://homologacao.sefaz.example/NFeAutorizacao4",
          nfce: "https://homologacao.sefaz.example/NFCeAutorizacao4",
        },
        buildSignedRequestXml: () => Effect.succeed("<enviNFe />"),
      });

      const issued = yield* provider.issue({ ...input, documentKind: "nfce" });

      expect(capturedEndpoint).toBe("https://homologacao.sefaz.example/NFCeAutorizacao4");
      expect(issued.documentRef.documentKind).toBe("nfce");
      expect(issued.providerResponse.status).toBe("authorized");
    }),
  );

  it.effect("expõe provider por Layer para runtimes Effect e Alchemy", () =>
    Effect.gen(function* () {
      const http: SefazHttpClient = {
        postAuthorizationXml: () =>
          Effect.succeed({
            status: 200,
            body: "<retEnviNFe><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></retEnviNFe>",
          }),
      };
      const providerLayer = createSefazProviderLayer({
        environment: "homologation",
        authorizationEndpoints: { nfe: "https://homologacao.sefaz.example/NFeAutorizacao4" },
        buildSignedRequestXml: () => Effect.succeed("<enviNFe />"),
      }).pipe(Layer.provide(createSefazHttpClientLayerFromClient(http)));

      const issued = yield* Effect.gen(function* () {
        const provider = yield* FiscalProviderService;
        return yield* provider.issue(input);
      }).pipe(Effect.provide(providerLayer));

      expect(issued.providerResponse.status).toBe("authorized");
    }),
  );

  it.effect("representa rejeição fiscal no canal de sucesso", () =>
    Effect.gen(function* () {
      const http: SefazHttpClient = {
        postAuthorizationXml: () =>
          Effect.succeed({
            status: 200,
            body: "<retEnviNFe><cStat>539</cStat><xMotivo>Duplicidade de NF-e</xMotivo></retEnviNFe>",
          }),
      };
      const provider = createSefazProvider(http, {
        environment: "homologation",
        authorizationEndpoints: { nfe: "https://homologacao.sefaz.example/NFeAutorizacao4" },
        buildSignedRequestXml: () => Effect.succeed("<enviNFe />"),
      });

      const issued = yield* provider.issue(input);

      expect(issued.providerResponse.status).toBe("rejected");
      expect(issued.providerResponse.rejections.map((rejection) => rejection.code)).toEqual([
        "539",
      ]);
      expect(issued.providerResponse.rejections.map((rejection) => rejection.message)).toEqual([
        "Duplicidade de NF-e",
      ]);
    }),
  );

  it.effect("falha tecnicamente quando products[] falta para NF-e", () =>
    Effect.gen(function* () {
      const http: SefazHttpClient = {
        postAuthorizationXml: () => Effect.succeed({ status: 200, body: "<retEnviNFe />" }),
      };
      const provider = createSefazProvider(http, {
        environment: "homologation",
        authorizationEndpoints: { nfe: "https://homologacao.sefaz.example/NFeAutorizacao4" },
        buildSignedRequestXml: () => Effect.succeed("<enviNFe />"),
      });

      const error = yield* Effect.flip(provider.issue({ ...input, products: undefined }));

      expect(error.code).toBe(SefazProviderErrorCodeValue.invalidInput);
    }),
  );

  it.effect("falha tecnicamente quando endpoint do documento não está configurado", () =>
    Effect.gen(function* () {
      const http: SefazHttpClient = {
        postAuthorizationXml: () => Effect.succeed({ status: 200, body: "<retEnviNFe />" }),
      };
      const provider = createSefazProvider(http, {
        environment: "homologation",
        authorizationEndpoints: { nfce: "https://homologacao.sefaz.example/NFeAutorizacao4" },
        buildSignedRequestXml: () => Effect.succeed("<enviNFe />"),
      });

      const error = yield* Effect.flip(provider.issue(input));

      expect(error.code).toBe(SefazProviderErrorCodeValue.configError);
    }),
  );
});

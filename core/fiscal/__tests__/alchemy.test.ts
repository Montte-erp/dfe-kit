import * as Test from "alchemy/Test/Vitest";
import { expect } from "@effect/vitest";
import { Effect, Layer } from "effect";
import {
  FiscalProviderService,
  type FiscalProvider,
  type FiscalProviderManifest,
  type IssueFiscalDocumentInput,
} from "../src/index";
import { createDfeKitAlchemyProviders, FiscalDocument } from "../src/alchemy";

const manifest: FiscalProviderManifest = {
  id: "test-fiscal-provider",
  name: "Provider fiscal de teste",
  documentKinds: ["nfse"],
  environments: ["homologation"],
  capabilities: ["issue_nfse"],
  capabilityMetadata: [{ capability: "issue_nfse", status: "supported" }],
};

const party = {
  legalName: "Test Party",
  cpf: "52998224725",
  address: {
    street: "Rua A",
    number: "1",
    district: "Centro",
    cityCode: "2917508",
    city: "Jacobina",
    state: "BA",
    postalCode: "44700000",
    countryCode: "1058",
  },
};

const input: IssueFiscalDocumentInput = {
  environment: "homologation",
  documentKind: "nfse",
  issuer: party,
  customer: party,
  services: [
    {
      description: "Servico",
      serviceListCode: "0101",
      amount: "10.00",
      taxRate: "2.5000",
      taxable: true,
    },
  ],
  series: "1",
  number: "1",
  issuedAt: "2026-01-01T00:00:00Z",
};

let issuedCount = 0;

const fiscalProvider: FiscalProvider = {
  manifest,
  issue: (document) =>
    Effect.gen(function* () {
      issuedCount += 1;
      const issuerTaxId = document.issuer.cnpj ?? document.issuer.cpf;
      if (issuerTaxId === undefined) {
        return yield* Effect.dieMessage("Documento fiscal sem CPF/CNPJ do emitente.");
      }
      return {
        documentRef: {
          documentKind: document.documentKind,
          providerId: manifest.id,
          environment: document.environment,
          issuerTaxId,
          series: document.series,
          number: document.number,
        },
        providerResponse: {
          status: "authorized",
          providerDocumentId: `issued-${issuedCount}`,
          protocol: `protocol-${issuedCount}`,
          rejections: [],
          artifacts: [],
        },
      };
    }),
};

const { test } = Test.make({
  providers: createDfeKitAlchemyProviders().pipe(
    Layer.provide(Layer.succeed(FiscalProviderService, fiscalProvider)),
  ),
});

test.provider("emite documento fiscal uma vez e reutiliza estado Alchemy", (stack) =>
  Effect.gen(function* () {
    issuedCount = 0;

    const first = yield* stack.deploy(FiscalDocument("nfse-1", input));
    const second = yield* stack.deploy(FiscalDocument("nfse-1", input));

    expect(first.providerResponse.status).toBe("authorized");
    expect(first.providerResponse.providerDocumentId).toBe("issued-1");
    expect(second.providerResponse.providerDocumentId).toBe("issued-1");
    expect(issuedCount).toBe(1);
  }),
);

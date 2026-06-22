import { describe, expect, it } from "@effect/vitest";
import type { FiscalProviderManifest, IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { Effect, Redacted, Schema } from "effect";
import { createSaatriProvider } from "../src/provider";
import { saatriEnvironmentConfigSchema } from "../src/config";
import type { SaatriCredentials, SaatriEnvironmentConfig } from "../src/config";

const manifest: FiscalProviderManifest = {
  id: "test-saatri",
  name: "Test SAATRI",
  documentKinds: ["nfse"],
  environments: ["homologation"],
  capabilities: ["issue_nfse"],
};

const credentials: SaatriCredentials = {
  username: "12345678909",
  password: Redacted.make("secret-password"),
  issuerCnpj: "31847389000139",
  municipalRegistration: "111111",
};

const config: SaatriEnvironmentConfig = {
  environment: "homologation",
  endpoint: "https://example-saatri.test/nfse.svc",
  cityCode: "2917508",
};

const input: IssueFiscalDocumentInput = {
  environment: "homologation",
  documentKind: "nfse",
  series: "1",
  number: "1",
  issuedAt: "2026-06-09T00:00:00Z",
  issuer: {
    legalName: "Empresa Prestadora LTDA",
    cnpj: "31847389000139",
    municipalRegistration: "111111",
    address: {
      street: "Rua Teste",
      number: "100",
      district: "Centro",
      cityCode: "2917508",
      city: "Jacobina",
      state: "BA",
      postalCode: "44700000",
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
      cityCode: "2917508",
      city: "Jacobina",
      state: "BA",
      postalCode: "44700000",
      countryCode: "1058",
    },
  },
  services: [
    {
      description: "Serviço de teste",
      serviceListCode: "010101010",
      amount: "150.00",
      taxable: true,
    },
  ],
};

describe("createSaatriProvider", () => {
  it.effect("rejeita endpoint que não parece SAATRI no schema de ambiente", () =>
    Effect.gen(function* () {
      const decoded = Schema.decodeUnknownEffect(saatriEnvironmentConfigSchema)({
        environment: "homologation",
        endpoint: "https://example.test/nfse.svc",
        cityCode: "2917508",
      });

      const exit = yield* Effect.exit(decoded);
      expect(exit._tag).toBe("Failure");
    }),
  );

  it.effect("valida ItemListaServico e CodigoNbs como rejeição fiscal sem chamar HTTP", () =>
    Effect.gen(function* () {
      let postCount = 0;
      const provider = createSaatriProvider({
        manifest,
        credentials,
        config,
        http: {
          postSoap: () => {
            postCount += 1;
            return Effect.succeed("");
          },
        },
      });

      const issued = yield* provider.issue(input);
      const response = issued.providerResponse;
      expect(response.status).toBe("rejected");
      expect(response.rejections.map((r) => r.code)).toEqual([
        "SAATRI_ITEM_LISTA_SERVICO_MAX_LENGTH",
        "SAATRI_CODIGO_NBS_REQUIRED_2026",
      ]);
      expect(postCount).toBe(0);
      expect(response.artifacts.map((artifact) => artifact.kind)).toContain("request_xml");
    }),
  );
});

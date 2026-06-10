import { describe, expect, test } from "bun:test";
import type { FiscalProviderManifest, IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { Result } from "better-result";
import { createSaatriProvider } from "../src/provider";
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
  password: "secret-password",
  issuerCnpj: "31847389000139",
  municipalRegistration: "111111",
};

const config: SaatriEnvironmentConfig = {
  environment: "homologation",
  endpoint: "https://example.test/nfse.svc",
  cityCode: "2917706",
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
      cityCode: "2917706",
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
      cityCode: "2917706",
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
  test("valida ItemListaServico e CodigoNbs como rejeição fiscal sem chamar HTTP", async () => {
    let postCount = 0;
    const provider = createSaatriProvider({
      manifest,
      credentials,
      config,
      http: {
        postSoap: () => {
          postCount += 1;
          return Promise.resolve(Result.ok(""));
        },
      },
    });

    const result = await provider.issue(input);
    expect(result.isOk()).toBe(true);
    const response = result.unwrap().providerResponse;
    expect(response.status).toBe("rejected");
    expect(response.rejections.map((r) => r.code)).toEqual([
      "SAATRI_ITEM_LISTA_SERVICO_MAX_LENGTH",
      "SAATRI_CODIGO_NBS_REQUIRED_2026",
    ]);
    expect(postCount).toBe(0);
    expect(response.artifacts.map((artifact) => artifact.kind)).toContain("request_xml");
  });
});

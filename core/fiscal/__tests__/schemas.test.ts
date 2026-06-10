import { describe, expect, test } from "bun:test";
import {
  fiscalDocumentRefSchema,
  fiscalProviderManifestSchema,
  taxPartySchema,
} from "../src/schemas";

describe("fiscal schemas", () => {
  test("issuerTaxId accepts only complete CPF or CNPJ values", () => {
    expect(
      fiscalDocumentRefSchema.safeParse({
        documentKind: "nfse",
        providerId: "jacobina-saatri",
        environment: "homologation",
        issuerTaxId: "52998224725",
        series: "1",
        number: "1",
      }).success,
    ).toBe(true);

    expect(
      fiscalDocumentRefSchema.safeParse({
        documentKind: "nfse",
        providerId: "jacobina-saatri",
        environment: "homologation",
        issuerTaxId: "11222333000181",
        series: "1",
        number: "1",
      }).success,
    ).toBe(true);

    expect(
      fiscalDocumentRefSchema.safeParse({
        documentKind: "nfse",
        providerId: "jacobina-saatri",
        environment: "homologation",
        issuerTaxId: "123456789012345",
        series: "1",
        number: "1",
      }).success,
    ).toBe(false);
  });

  test("manifest accepts capability metadata without exposing unsupported capabilities", () => {
    const parsed = fiscalProviderManifestSchema.safeParse({
      id: "jacobina-saatri",
      name: "SAATRI Jacobina-BA",
      documentKinds: ["nfse"],
      environments: ["homologation", "production"],
      capabilities: ["issue_nfse"],
      capabilityMetadata: [
        { capability: "issue_nfse", status: "supported" },
        {
          capability: "query_nfse_by_rps",
          status: "unverified_in_homologation",
          requiresSigner: false,
          requiresCertificateOutsideDFeKit: false,
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  test("taxParty uses zod's top-level email validator", () => {
    const base = {
      legalName: "Test Customer",
      cpf: "52998224725",
      address: {
        street: "Rua A",
        number: "1",
        district: "Centro",
        cityCode: "2917706",
        city: "Jacobina",
        state: "BA",
        postalCode: "44700000",
        countryCode: "1058",
      },
    };

    expect(taxPartySchema.safeParse({ ...base, email: "customer@example.com" }).success).toBe(true);
    expect(taxPartySchema.safeParse({ ...base, email: "invalid-email" }).success).toBe(false);
  });
});

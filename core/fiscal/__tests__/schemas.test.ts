import { describe, expect, it } from "@effect/vitest";
import { Option, Schema } from "effect";
import {
  fiscalDocumentRefSchema,
  fiscalProviderManifestSchema,
  issueFiscalDocumentInputSchema,
  taxPartySchema,
} from "../src/schemas";

const decodes = <S extends Schema.Codec<unknown, unknown>>(schema: S, input: unknown): boolean =>
  Option.isSome(Schema.decodeUnknownOption(schema)(input));

describe("fiscal schemas", () => {
  it("issuerTaxId accepts only complete CPF or CNPJ values", () => {
    expect(
      decodes(fiscalDocumentRefSchema, {
        documentKind: "nfse",
        providerId: "jacobina-saatri",
        environment: "homologation",
        issuerTaxId: "52998224725",
        series: "1",
        number: "1",
      }),
    ).toBe(true);

    expect(
      decodes(fiscalDocumentRefSchema, {
        documentKind: "nfse",
        providerId: "jacobina-saatri",
        environment: "homologation",
        issuerTaxId: "11222333000181",
        series: "1",
        number: "1",
      }),
    ).toBe(true);

    expect(
      decodes(fiscalDocumentRefSchema, {
        documentKind: "nfse",
        providerId: "jacobina-saatri",
        environment: "homologation",
        issuerTaxId: "123456789012345",
        series: "1",
        number: "1",
      }),
    ).toBe(false);
  });

  it("manifest accepts capability metadata without exposing unsupported capabilities", () => {
    expect(
      decodes(fiscalProviderManifestSchema, {
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
      }),
    ).toBe(true);
  });

  it("taxParty validates Brazilian state and postal code with fiscal schemas", () => {
    const base = {
      legalName: "Test Customer",
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

    expect(decodes(taxPartySchema, base)).toBe(true);
    expect(decodes(taxPartySchema, { ...base, address: { ...base.address, state: "XX" } })).toBe(
      false,
    );
    expect(
      decodes(taxPartySchema, { ...base, address: { ...base.address, postalCode: "44700-000" } }),
    ).toBe(false);
  });

  it("issue input validates fiscal money and tax rate shapes", () => {
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
    const base = {
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

    expect(decodes(issueFiscalDocumentInputSchema, base)).toBe(true);
    expect(
      decodes(issueFiscalDocumentInputSchema, {
        ...base,
        services: [{ ...base.services[0], amount: "10.0" }],
      }),
    ).toBe(false);
    expect(
      decodes(issueFiscalDocumentInputSchema, {
        ...base,
        services: [{ ...base.services[0], taxRate: "2.5" }],
      }),
    ).toBe(false);
  });

  it("issue input aceita products[] para NF-e e NFC-e", () => {
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
    const base = {
      environment: "homologation",
      documentKind: "nfe",
      issuer: party,
      customer: party,
      products: [
        {
          description: "Produto",
          cfop: "5102",
          ncm: "01012100",
          quantity: "1.0000",
          unit: "UN",
          unitAmount: "10.00",
          totalAmount: "10.00",
          taxable: true,
        },
      ],
      series: "1",
      number: "1",
      issuedAt: "2026-01-01T00:00:00Z",
    };

    expect(decodes(issueFiscalDocumentInputSchema, base)).toBe(true);
    expect(decodes(issueFiscalDocumentInputSchema, { ...base, products: undefined })).toBe(false);
    expect(
      decodes(issueFiscalDocumentInputSchema, {
        ...base,
        products: [{ ...base.products[0], cfop: "510" }],
      }),
    ).toBe(false);
  });

  it("taxParty validates email using Effect Schema", () => {
    const base = {
      legalName: "Test Customer",
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

    expect(decodes(taxPartySchema, { ...base, email: "customer@example.com" })).toBe(true);
    expect(decodes(taxPartySchema, { ...base, email: "invalid-email" })).toBe(false);
  });
});

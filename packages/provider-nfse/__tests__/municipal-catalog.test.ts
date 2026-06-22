import { describe, expect, it } from "@effect/vitest";
import { issueFiscalDocumentInputSchema, taxPartySchema } from "@dfe-kit/fiscal/schemas";
import { Effect, Schema } from "effect";
import {
  createNfseMunicipalPortalManifestByProviderId,
  getNfseMunicipalPortalByCityCode,
  getNfseMunicipalPortalByProviderId,
  getNfseMunicipalPortalsByState,
  municipalNfseEndpointForEnvironment,
  nfseMunicipalPortalCatalog,
  nfseMunicipalPortalStates,
} from "../src/index";
import { olharyCompany } from "./company-fixtures";

describe("nfseMunicipalPortalCatalog", () => {
  it("mapeia Juiz de Fora-MG como portal municipal ABRASF 2.02", () => {
    const portal = getNfseMunicipalPortalByCityCode("3136702");

    expect(portal?.providerId).toBe("juiz-de-fora-mg-nfse");
    expect(portal?.cityName).toBe("Juiz de Fora");
    expect(portal?.state).toBe("MG");
    expect(portal?.family).toBe("pjf-abrasf-2.02");
    expect(portal?.layoutVersion).toBe("ABRASF 2.02");
    expect(portal?.portalUrl).toBe("https://nfse.pjf.mg.gov.br/");
    expect(portal?.endpoints).toEqual({
      homologation: "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx",
      production: "https://nfse.pjf.mg.gov.br:4431/WebService.asmx",
    });
    expect(portal?.wsdl.homologation).toBe(
      "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx?WSDL",
    );
    expect(portal?.maxXmlBytes).toBe(512 * 1024);
    expect(portal?.maxRpsPerBatch).toBe(250);
    expect(portal?.requiresSigner).toBe(true);
    expect(portal?.requiresCertificateOutsideDFeKit).toBe(true);
  });

  it("separa catálogo municipal por município e depois por estado", () => {
    expect(nfseMunicipalPortalStates).toEqual(["MG"]);
    expect(nfseMunicipalPortalCatalog.map((portal) => portal.cityCode)).toEqual(["3136702"]);
    expect(getNfseMunicipalPortalsByState("MG").map((portal) => portal.providerId)).toEqual([
      "juiz-de-fora-mg-nfse",
    ]);
    expect(getNfseMunicipalPortalByProviderId("juiz-de-fora-mg-nfse").cityCode).toBe("3136702");
  });

  it("gera manifest honesto sem instanciar runtime municipal", () => {
    const manifest = createNfseMunicipalPortalManifestByProviderId("juiz-de-fora-mg-nfse");

    expect(manifest.id).toBe("juiz-de-fora-mg-nfse");
    expect(manifest.documentKinds).toEqual(["nfse"]);
    expect(manifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      manifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")?.status,
    ).toBe("unverified_in_homologation");
    expect(
      manifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")?.status,
    ).toBe("unsupported");
  });

  it("resolve endpoint municipal pelo ambiente", () => {
    const portal = getNfseMunicipalPortalByProviderId("juiz-de-fora-mg-nfse");

    expect(municipalNfseEndpointForEnvironment(portal, "homologation")).toBe(
      "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx",
    );
    expect(municipalNfseEndpointForEnvironment(portal, "production")).toBe(
      "https://nfse.pjf.mg.gov.br:4431/WebService.asmx",
    );
  });

  it.effect("valida OLHARY do CNPJ PDF como tomador em emissão municipal", () =>
    Effect.gen(function* () {
      const company = yield* Schema.decodeUnknownEffect(taxPartySchema)(olharyCompany);
      const decoded = yield* Schema.decodeUnknownEffect(issueFiscalDocumentInputSchema)({
        environment: "homologation",
        documentKind: "nfse",
        series: "PJF",
        number: "3136702001",
        issuedAt: "2026-06-21T00:00:00Z",
        issuer: {
          legalName: "Prestador Juiz de Fora LTDA",
          cnpj: "31847389000139",
          municipalRegistration: "111111",
          address: {
            street: "Avenida Barão do Rio Branco",
            number: "100",
            district: "Centro",
            cityCode: "3136702",
            city: "Juiz de Fora",
            state: "MG",
            postalCode: "36010000",
            countryCode: "1058",
          },
        },
        customer: company,
        services: [
          {
            description: "Serviço para OLHARY LTDA",
            serviceListCode: "010101",
            amount: "150.00",
            taxable: true,
          },
        ],
      });

      expect(decoded.customer.legalName).toBe("OLHARY LTDA");
      expect(decoded.customer.cnpj).toBe("60758275000110");
      expect(decoded.customer.address.cityCode).toBe("3550308");
    }),
  );
});

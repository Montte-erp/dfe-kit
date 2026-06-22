import { describe, expect, it } from "@effect/vitest";
import {
  JUIZ_DE_FORA_CITY_CODE,
  JUIZ_DE_FORA_NFSE_HOMOLOGATION_ENDPOINT,
  JUIZ_DE_FORA_NFSE_HOMOLOGATION_WSDL,
  JUIZ_DE_FORA_NFSE_PORTAL,
  JUIZ_DE_FORA_NFSE_PRODUCTION_ENDPOINT,
  JUIZ_DE_FORA_NFSE_PRODUCTION_WSDL,
  juizDeForaNfseManifest,
} from "../src/index";

describe("@dfe-kit/juiz-de-fora-nfse", () => {
  it("lista portal, endpoints, WSDL e capabilities de Juiz de Fora", () => {
    expect(JUIZ_DE_FORA_CITY_CODE).toBe("3136702");
    expect(JUIZ_DE_FORA_NFSE_HOMOLOGATION_ENDPOINT).toBe(
      "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx",
    );
    expect(JUIZ_DE_FORA_NFSE_PRODUCTION_ENDPOINT).toBe(
      "https://nfse.pjf.mg.gov.br:4431/WebService.asmx",
    );
    expect(JUIZ_DE_FORA_NFSE_HOMOLOGATION_WSDL).toBe(
      "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx?WSDL",
    );
    expect(JUIZ_DE_FORA_NFSE_PRODUCTION_WSDL).toBe(
      "https://nfse.pjf.mg.gov.br:4431/WebService.asmx?WSDL",
    );
    expect(JUIZ_DE_FORA_NFSE_PORTAL.layoutVersion).toBe("ABRASF 2.02");
    expect(juizDeForaNfseManifest.id).toBe("juiz-de-fora-mg-nfse");
    expect(juizDeForaNfseManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      juizDeForaNfseManifest.capabilityMetadata?.find(
        (metadata) => metadata.capability === "issue_nfse",
      )?.status,
    ).toBe("unverified_in_homologation");
  });
});

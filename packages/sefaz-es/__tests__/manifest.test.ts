import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_ES_STATE_CODE, sefazEsManifest } from "../src/index";

describe("@dfe-kit/sefaz-es", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_ES_STATE_CODE).toBe("ES");
    expect(sefazEsManifest.id).toBe("sefaz-es");
    expect(sefazEsManifest.name).toBe("SEFAZ Espírito Santo NF-e/NFC-e (modelo 55/65)");
    expect(sefazEsManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazEsManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazEsManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazEsManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_PA_STATE_CODE, sefazPaManifest } from "../src/index";

describe("@dfe-kit/sefaz-pa", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_PA_STATE_CODE).toBe("PA");
    expect(sefazPaManifest.id).toBe("sefaz-pa");
    expect(sefazPaManifest.name).toBe("SEFAZ Pará NF-e/NFC-e (modelo 55/65)");
    expect(sefazPaManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazPaManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazPaManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazPaManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

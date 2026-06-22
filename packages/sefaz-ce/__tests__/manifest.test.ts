import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_CE_STATE_CODE, sefazCeManifest } from "../src/index";

describe("@dfe-kit/sefaz-ce", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_CE_STATE_CODE).toBe("CE");
    expect(sefazCeManifest.id).toBe("sefaz-ce");
    expect(sefazCeManifest.name).toBe("SEFAZ Ceará NF-e/NFC-e (modelo 55/65)");
    expect(sefazCeManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazCeManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazCeManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazCeManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

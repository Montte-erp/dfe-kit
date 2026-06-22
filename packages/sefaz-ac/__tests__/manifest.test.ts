import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_AC_STATE_CODE, sefazAcManifest } from "../src/index";

describe("@dfe-kit/sefaz-ac", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_AC_STATE_CODE).toBe("AC");
    expect(sefazAcManifest.id).toBe("sefaz-ac");
    expect(sefazAcManifest.name).toBe("SEFAZ Acre NF-e/NFC-e (modelo 55/65)");
    expect(sefazAcManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazAcManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazAcManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazAcManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

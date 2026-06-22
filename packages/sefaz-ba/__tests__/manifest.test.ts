import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_BA_STATE_CODE, sefazBaManifest } from "../src/index";

describe("@dfe-kit/sefaz-ba", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_BA_STATE_CODE).toBe("BA");
    expect(sefazBaManifest.id).toBe("sefaz-ba");
    expect(sefazBaManifest.name).toBe("SEFAZ Bahia NF-e/NFC-e (modelo 55/65)");
    expect(sefazBaManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazBaManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazBaManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazBaManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_AL_STATE_CODE, sefazAlManifest } from "../src/index";

describe("@dfe-kit/sefaz-al", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_AL_STATE_CODE).toBe("AL");
    expect(sefazAlManifest.id).toBe("sefaz-al");
    expect(sefazAlManifest.name).toBe("SEFAZ Alagoas NF-e/NFC-e (modelo 55/65)");
    expect(sefazAlManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazAlManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazAlManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazAlManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

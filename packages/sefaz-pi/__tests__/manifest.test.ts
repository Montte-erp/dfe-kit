import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_PI_STATE_CODE, sefazPiManifest } from "../src/index";

describe("@dfe-kit/sefaz-pi", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_PI_STATE_CODE).toBe("PI");
    expect(sefazPiManifest.id).toBe("sefaz-pi");
    expect(sefazPiManifest.name).toBe("SEFAZ Piauí NF-e/NFC-e (modelo 55/65)");
    expect(sefazPiManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazPiManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazPiManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazPiManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

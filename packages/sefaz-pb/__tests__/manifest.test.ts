import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_PB_STATE_CODE, sefazPbManifest } from "../src/index";

describe("@dfe-kit/sefaz-pb", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_PB_STATE_CODE).toBe("PB");
    expect(sefazPbManifest.id).toBe("sefaz-pb");
    expect(sefazPbManifest.name).toBe("SEFAZ Paraíba NF-e/NFC-e (modelo 55/65)");
    expect(sefazPbManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazPbManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazPbManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazPbManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

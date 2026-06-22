import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_DF_STATE_CODE, sefazDfManifest } from "../src/index";

describe("@dfe-kit/sefaz-df", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_DF_STATE_CODE).toBe("DF");
    expect(sefazDfManifest.id).toBe("sefaz-df");
    expect(sefazDfManifest.name).toBe("SEFAZ Distrito Federal NF-e/NFC-e (modelo 55/65)");
    expect(sefazDfManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazDfManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazDfManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazDfManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

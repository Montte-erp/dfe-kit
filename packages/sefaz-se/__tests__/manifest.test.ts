import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_SE_STATE_CODE, sefazSeManifest } from "../src/index";

describe("@dfe-kit/sefaz-se", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_SE_STATE_CODE).toBe("SE");
    expect(sefazSeManifest.id).toBe("sefaz-se");
    expect(sefazSeManifest.name).toBe("SEFAZ Sergipe NF-e/NFC-e (modelo 55/65)");
    expect(sefazSeManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazSeManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazSeManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazSeManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

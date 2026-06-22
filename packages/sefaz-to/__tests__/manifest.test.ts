import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_TO_STATE_CODE, sefazToManifest } from "../src/index";

describe("@dfe-kit/sefaz-to", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_TO_STATE_CODE).toBe("TO");
    expect(sefazToManifest.id).toBe("sefaz-to");
    expect(sefazToManifest.name).toBe("SEFAZ Tocantins NF-e/NFC-e (modelo 55/65)");
    expect(sefazToManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazToManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazToManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazToManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

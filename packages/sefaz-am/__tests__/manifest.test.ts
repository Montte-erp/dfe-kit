import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_AM_STATE_CODE, sefazAmManifest } from "../src/index";

describe("@dfe-kit/sefaz-am", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_AM_STATE_CODE).toBe("AM");
    expect(sefazAmManifest.id).toBe("sefaz-am");
    expect(sefazAmManifest.name).toBe("SEFAZ Amazonas NF-e/NFC-e (modelo 55/65)");
    expect(sefazAmManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazAmManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazAmManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazAmManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

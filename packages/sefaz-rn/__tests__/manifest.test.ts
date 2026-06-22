import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_RN_STATE_CODE, sefazRnManifest } from "../src/index";

describe("@dfe-kit/sefaz-rn", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_RN_STATE_CODE).toBe("RN");
    expect(sefazRnManifest.id).toBe("sefaz-rn");
    expect(sefazRnManifest.name).toBe("SEFAZ Rio Grande do Norte NF-e/NFC-e (modelo 55/65)");
    expect(sefazRnManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazRnManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazRnManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazRnManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

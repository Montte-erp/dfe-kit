import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_RO_STATE_CODE, sefazRoManifest } from "../src/index";

describe("@dfe-kit/sefaz-ro", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_RO_STATE_CODE).toBe("RO");
    expect(sefazRoManifest.id).toBe("sefaz-ro");
    expect(sefazRoManifest.name).toBe("SEFAZ Rondônia NF-e/NFC-e (modelo 55/65)");
    expect(sefazRoManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazRoManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazRoManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazRoManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

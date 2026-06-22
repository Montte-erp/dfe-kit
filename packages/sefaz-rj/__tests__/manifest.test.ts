import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_RJ_STATE_CODE, sefazRjManifest } from "../src/index";

describe("@dfe-kit/sefaz-rj", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_RJ_STATE_CODE).toBe("RJ");
    expect(sefazRjManifest.id).toBe("sefaz-rj");
    expect(sefazRjManifest.name).toBe("SEFAZ Rio de Janeiro NF-e/NFC-e (modelo 55/65)");
    expect(sefazRjManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazRjManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazRjManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazRjManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_RS_STATE_CODE, sefazRsManifest } from "../src/index";

describe("@dfe-kit/sefaz-rs", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_RS_STATE_CODE).toBe("RS");
    expect(sefazRsManifest.id).toBe("sefaz-rs");
    expect(sefazRsManifest.name).toBe("SEFAZ Rio Grande do Sul NF-e/NFC-e (modelo 55/65)");
    expect(sefazRsManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazRsManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazRsManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazRsManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

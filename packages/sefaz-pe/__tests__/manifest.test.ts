import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_PE_STATE_CODE, sefazPeManifest } from "../src/index";

describe("@dfe-kit/sefaz-pe", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_PE_STATE_CODE).toBe("PE");
    expect(sefazPeManifest.id).toBe("sefaz-pe");
    expect(sefazPeManifest.name).toBe("SEFAZ Pernambuco NF-e/NFC-e (modelo 55/65)");
    expect(sefazPeManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazPeManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazPeManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazPeManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

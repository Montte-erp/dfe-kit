import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_AP_STATE_CODE, sefazApManifest } from "../src/index";

describe("@dfe-kit/sefaz-ap", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_AP_STATE_CODE).toBe("AP");
    expect(sefazApManifest.id).toBe("sefaz-ap");
    expect(sefazApManifest.name).toBe("SEFAZ Amapá NF-e/NFC-e (modelo 55/65)");
    expect(sefazApManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazApManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazApManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazApManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

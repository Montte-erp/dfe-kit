import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_PR_STATE_CODE, sefazPrManifest } from "../src/index";

describe("@dfe-kit/sefaz-pr", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_PR_STATE_CODE).toBe("PR");
    expect(sefazPrManifest.id).toBe("sefaz-pr");
    expect(sefazPrManifest.name).toBe("SEFAZ Paraná NF-e/NFC-e (modelo 55/65)");
    expect(sefazPrManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazPrManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazPrManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazPrManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

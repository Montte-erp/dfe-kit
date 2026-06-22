import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_MA_STATE_CODE, sefazMaManifest } from "../src/index";

describe("@dfe-kit/sefaz-ma", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_MA_STATE_CODE).toBe("MA");
    expect(sefazMaManifest.id).toBe("sefaz-ma");
    expect(sefazMaManifest.name).toBe("SEFAZ Maranhão NF-e/NFC-e (modelo 55/65)");
    expect(sefazMaManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazMaManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazMaManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazMaManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_MT_STATE_CODE, sefazMtManifest } from "../src/index";

describe("@dfe-kit/sefaz-mt", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_MT_STATE_CODE).toBe("MT");
    expect(sefazMtManifest.id).toBe("sefaz-mt");
    expect(sefazMtManifest.name).toBe("SEFAZ Mato Grosso NF-e/NFC-e (modelo 55/65)");
    expect(sefazMtManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazMtManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazMtManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazMtManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

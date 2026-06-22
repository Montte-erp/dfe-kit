import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_MG_STATE_CODE, sefazMgManifest } from "../src/index";

describe("@dfe-kit/sefaz-mg", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_MG_STATE_CODE).toBe("MG");
    expect(sefazMgManifest.id).toBe("sefaz-mg");
    expect(sefazMgManifest.name).toBe("SEFAZ Minas Gerais NF-e/NFC-e (modelo 55/65)");
    expect(sefazMgManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazMgManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazMgManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazMgManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

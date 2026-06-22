import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_SP_STATE_CODE, sefazSpManifest } from "../src/index";

describe("@dfe-kit/sefaz-sp", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_SP_STATE_CODE).toBe("SP");
    expect(sefazSpManifest.id).toBe("sefaz-sp");
    expect(sefazSpManifest.name).toBe("SEFAZ São Paulo NF-e/NFC-e (modelo 55/65)");
    expect(sefazSpManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazSpManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazSpManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazSpManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

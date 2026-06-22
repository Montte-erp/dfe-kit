import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_MS_STATE_CODE, sefazMsManifest } from "../src/index";

describe("@dfe-kit/sefaz-ms", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_MS_STATE_CODE).toBe("MS");
    expect(sefazMsManifest.id).toBe("sefaz-ms");
    expect(sefazMsManifest.name).toBe("SEFAZ Mato Grosso do Sul NF-e/NFC-e (modelo 55/65)");
    expect(sefazMsManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazMsManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazMsManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazMsManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

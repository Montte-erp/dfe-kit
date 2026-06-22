import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_GO_STATE_CODE, sefazGoManifest } from "../src/index";

describe("@dfe-kit/sefaz-go", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_GO_STATE_CODE).toBe("GO");
    expect(sefazGoManifest.id).toBe("sefaz-go");
    expect(sefazGoManifest.name).toBe("SEFAZ Goiás NF-e/NFC-e (modelo 55/65)");
    expect(sefazGoManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazGoManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazGoManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazGoManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

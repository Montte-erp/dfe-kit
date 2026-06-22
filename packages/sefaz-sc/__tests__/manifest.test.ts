import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_SC_STATE_CODE, sefazScManifest } from "../src/index";

describe("@dfe-kit/sefaz-sc", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_SC_STATE_CODE).toBe("SC");
    expect(sefazScManifest.id).toBe("sefaz-sc");
    expect(sefazScManifest.name).toBe("SEFAZ Santa Catarina NF-e/NFC-e (modelo 55/65)");
    expect(sefazScManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazScManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazScManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazScManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

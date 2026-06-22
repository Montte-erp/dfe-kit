import { describe, expect, it } from "@effect/vitest";
import { SEFAZ_RR_STATE_CODE, sefazRrManifest } from "../src/index";

describe("@dfe-kit/sefaz-rr", () => {
  it("lista capabilities do estado", () => {
    expect(SEFAZ_RR_STATE_CODE).toBe("RR");
    expect(sefazRrManifest.id).toBe("sefaz-rr");
    expect(sefazRrManifest.name).toBe("SEFAZ Roraima NF-e/NFC-e (modelo 55/65)");
    expect(sefazRrManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazRrManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      sefazRrManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfe")
        ?.status,
    ).toBe("unverified_in_homologation");
    expect(
      sefazRrManifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")
        ?.status,
    ).toBe("unsupported");
  });
});

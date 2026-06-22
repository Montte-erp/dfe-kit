import { describe, expect, it } from "@effect/vitest";
import { createSefazStateManifest, sefazManifest, sefazStatePortalByState } from "../src/index";

describe("sefazManifest", () => {
  it("declara NF-e e NFC-e sem fingir homologação", () => {
    expect(sefazManifest.id).toBe("adapter-sefaz");
    expect(sefazManifest.documentKinds).toEqual(["nfe", "nfce"]);
    expect(sefazManifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(sefazManifest.capabilityMetadata?.map((metadata) => metadata.status)).toContain(
      "unverified_in_homologation",
    );
  });

  it("marca certificado e assinatura como responsabilidade externa", () => {
    const nfe = sefazManifest.capabilityMetadata?.find(
      (metadata) => metadata.capability === "issue_nfe",
    );
    const nfce = sefazManifest.capabilityMetadata?.find(
      (metadata) => metadata.capability === "issue_nfce",
    );

    expect(nfe?.requiresSigner).toBe(true);
    expect(nfe?.requiresCertificateOutsideDFeKit).toBe(true);
    expect(nfce?.requiresSigner).toBe(true);
    expect(nfce?.requiresCertificateOutsideDFeKit).toBe(true);
  });

  it("centraliza manifests estaduais no catálogo do adapter", () => {
    const manifest = createSefazStateManifest("MG");

    expect(sefazStatePortalByState.MG.stateName).toBe("Minas Gerais");
    expect(manifest.id).toBe("sefaz-mg");
    expect(manifest.name).toBe("SEFAZ Minas Gerais NF-e/NFC-e (modelo 55/65)");
    expect(manifest.capabilities).toEqual(["issue_nfe", "issue_nfce"]);
    expect(
      manifest.capabilityMetadata?.find((metadata) => metadata.capability === "issue_nfse")?.status,
    ).toBe("unsupported");
  });
});

import { describe, expect, it } from "@effect/vitest";
import packageJson from "../package.json";
import {
  NFSE_NACIONAL_HOMOLOGATION_ENDPOINT,
  NFSE_NACIONAL_PRODUCTION_ENDPOINT,
  nfseNacionalManifest,
} from "../src/manifest";

describe("nfseNacionalManifest", () => {
  it("declara endpoints oficiais da Sefin Nacional", () => {
    expect(NFSE_NACIONAL_HOMOLOGATION_ENDPOINT).toBe(
      "https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional",
    );
    expect(NFSE_NACIONAL_PRODUCTION_ENDPOINT).toBe("https://sefin.nfse.gov.br/SefinNacional");
  });

  it("declara emissão nacional com certificado e assinatura fora do DFeKit", () => {
    expect(nfseNacionalManifest.id).toBe("provider-nfse");
    expect(nfseNacionalManifest.capabilities).toEqual(["issue_nfse"]);
    const issueMetadata = nfseNacionalManifest.capabilityMetadata?.find(
      (metadata) => metadata.capability === "issue_nfse",
    );
    expect(issueMetadata?.status).toBe("supported");
    expect(issueMetadata?.requiresSigner).toBe(true);
    expect(issueMetadata?.requiresCertificateOutsideDFeKit).toBe(true);
  });

  it("não finge suporte a consultas e eventos ainda não implementados", () => {
    expect(
      nfseNacionalManifest.capabilityMetadata?.find(
        (metadata) => metadata.capability === "cancel_nfse",
      )?.status,
    ).toBe("unverified_in_homologation");
    expect(
      nfseNacionalManifest.capabilityMetadata?.find(
        (metadata) => metadata.capability === "submit_rps_batch",
      )?.status,
    ).toBe("unsupported");
  });

  it("expõe subpaths explícitos sem runtime barrel", () => {
    expect(packageJson.exports["./manifest"]).toEqual({
      types: "./dist/manifest.d.ts",
      import: "./dist/manifest.js",
    });
    expect(packageJson.exports["./runtime"]).toBeUndefined();
  });
});

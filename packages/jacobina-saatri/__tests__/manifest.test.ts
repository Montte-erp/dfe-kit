import { describe, expect, test } from "bun:test";
import { jacobinaSaatriManifest } from "../src/index";
import {
  SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
  SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
} from "../src/manifest";

describe("jacobinaSaatriManifest", () => {
  test("usa endpoints Jacobina informados pelo manual SAATRI", () => {
    expect(SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-homologa-jacobina.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_JACOBINA_PRODUCTION_ENDPOINT).toBe(
      "https://homologa-jacobina.saatri.com.br/servicos/nfse.svc",
    );
  });

  test("declara somente capacidade comprovada e mantém catálogo não fingido", () => {
    expect(jacobinaSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      jacobinaSaatriManifest.capabilityMetadata?.find(
        (metadata) => metadata.capability === "query_nfse_by_rps",
      )?.status,
    ).toBe("unverified_in_homologation");
  });
});

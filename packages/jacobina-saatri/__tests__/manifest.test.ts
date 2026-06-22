import { describe, expect, it } from "@effect/vitest";
import packageJson from "../package.json";
import {
  jacobinaSaatriManifest,
  JACOBINA_CITY_CODE,
  SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
  SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
} from "../src/manifest";

describe("jacobinaSaatriManifest", () => {
  it("usa endpoints Jacobina informados pelo manual SAATRI", () => {
    expect(SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-jacobina.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_JACOBINA_PRODUCTION_ENDPOINT).toBe(
      "https://jacobina.saatri.com.br/servicos/nfse.svc",
    );
  });

  it("usa código IBGE correto de Jacobina-BA", () => {
    expect(JACOBINA_CITY_CODE).toBe("2917508");
  });

  it("declara somente capacidade comprovada e mantém catálogo não fingido", () => {
    expect(jacobinaSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      jacobinaSaatriManifest.capabilityMetadata?.find(
        (metadata) => metadata.capability === "query_nfse_by_rps",
      )?.status,
    ).toBe("unverified_in_homologation");
  });

  it("expõe subpaths explícitos para manifest e runtime", () => {
    expect(packageJson.exports["./manifest"]).toEqual({
      types: "./dist/manifest.d.ts",
      import: "./dist/manifest.js",
    });
    expect(packageJson.exports["./runtime"]).toEqual({
      types: "./dist/runtime.d.ts",
      import: "./dist/runtime.js",
    });
  });
});

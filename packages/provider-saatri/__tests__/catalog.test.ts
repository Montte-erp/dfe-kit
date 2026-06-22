import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createSaatriMunicipalityManifest,
  createSaatriProviderLayerFromConfig,
  getSaatriMunicipalitiesByState,
  getSaatriMunicipalityByCityCode,
  getSaatriMunicipalityByProviderId,
  saatriMunicipalityCatalog,
  saatriMunicipalityStates,
} from "../src/index";

const credentials = {
  username: "12345678909",
  password: Redacted.make("secret-password"),
  issuerCnpj: "31847389000139",
  municipalRegistration: "111111",
};
describe("saatriMunicipalityCatalog", () => {
  it("mapeia prefeituras SAATRI usadas pelos packages municipais", () => {
    expect(saatriMunicipalityCatalog.map((municipality) => municipality.config.providerId)).toEqual(
      [
        "boavista-saatri",
        "itaberaba-saatri",
        "ipira-saatri",
        "sao-francisco-do-conde-saatri",
        "pojuca-saatri",
        "sao-desiderio-saatri",
        "amargosa-saatri",
        "sento-se-saatri",
        "serra-do-ramalho-saatri",
        "morro-do-chapeu-saatri",
      ],
    );
  });

  it("resolve por providerId e cityCode", () => {
    expect(getSaatriMunicipalityByProviderId("boavista-saatri")?.config.cityCode).toBe("1400100");
    expect(getSaatriMunicipalityByCityCode("2929206")?.config.providerId).toBe(
      "sao-francisco-do-conde-saatri",
    );
  });

  it("separa catálogo primeiro por município e depois por estado", () => {
    expect(saatriMunicipalityStates).toEqual(["RR", "BA"]);
    expect(
      getSaatriMunicipalitiesByState("RR").map((municipality) => municipality.cityName),
    ).toEqual(["Boa Vista"]);
    expect(
      getSaatriMunicipalitiesByState("BA").map((municipality) => municipality.config.providerId),
    ).toEqual([
      "itaberaba-saatri",
      "ipira-saatri",
      "sao-francisco-do-conde-saatri",
      "pojuca-saatri",
      "sao-desiderio-saatri",
      "amargosa-saatri",
      "sento-se-saatri",
      "serra-do-ramalho-saatri",
      "morro-do-chapeu-saatri",
    ]);
  });

  it("gera manifest fiscal sem instanciar runtime", () => {
    const config = getSaatriMunicipalityByProviderId("morro-do-chapeu-saatri")?.config;
    expect(config).toBeDefined();
    if (config !== undefined) {
      const manifest = createSaatriMunicipalityManifest(config);
      expect(manifest.id).toBe("morro-do-chapeu-saatri");
      expect(manifest.documentKinds).toEqual(["nfse"]);
      expect(manifest.capabilities).toContain("issue_nfse");
    }
  });

  it.effect("expõe prefeitura SAATRI como FiscalProvider Layer", () =>
    Effect.gen(function* () {
      const config = getSaatriMunicipalityByProviderId("boavista-saatri")?.config;
      expect(config).toBeDefined();
      if (config === undefined) {
        return;
      }

      const providerId = yield* Effect.map(
        FiscalProviderService,
        (provider) => provider.manifest.id,
      ).pipe(
        Effect.provide(
          createSaatriProviderLayerFromConfig(config, credentials, {
            environment: "homologation",
          }),
        ),
      );

      expect(providerId).toBe("boavista-saatri");
    }),
  );
});

import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createSaoDesiderioSaatriProviderLayer,
  SAO_DESIDERIO_CITY_CODE,
  saoDesiderioSaatriManifest,
  SAATRI_SAO_DESIDERIO_HOMOLOGATION_ENDPOINT,
  SAATRI_SAO_DESIDERIO_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/sao-desiderio-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(SAO_DESIDERIO_CITY_CODE).toBe("2928901");
    expect(SAATRI_SAO_DESIDERIO_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-saodesiderio.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_SAO_DESIDERIO_PRODUCTION_ENDPOINT).toBe(
      "https://saodesiderio.saatri.com.br/servicos/nfse.svc",
    );
    expect(saoDesiderioSaatriManifest.id).toBe("sao-desiderio-saatri");
    expect(saoDesiderioSaatriManifest.name).toBe("SAATRI São Desidério-BA (NFS-e ABRASF 2.03)");
    expect(saoDesiderioSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(saoDesiderioSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      saoDesiderioSaatriManifest.capabilityMetadata?.find(
        (metadata) => metadata.capability === "issue_nfse",
      )?.status,
    ).toBe("supported");
  });

  it.effect("expõe o município como FiscalProvider Layer", () =>
    Effect.gen(function* () {
      const providerId = yield* Effect.map(
        FiscalProviderService,
        (provider) => provider.manifest.id,
      ).pipe(
        Effect.provide(
          createSaoDesiderioSaatriProviderLayer(
            {
              username: "12345678909",
              password: Redacted.make("secret-password"),
              issuerCnpj: "31847389000139",
              municipalRegistration: "111111",
            },
            { environment: "homologation" },
          ),
        ),
      );

      expect(providerId).toBe("sao-desiderio-saatri");
    }),
  );
});

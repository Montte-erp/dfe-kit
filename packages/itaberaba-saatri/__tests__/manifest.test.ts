import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createItaberabaSaatriProviderLayer,
  ITABERABA_CITY_CODE,
  itaberabaSaatriManifest,
  SAATRI_ITABERABA_HOMOLOGATION_ENDPOINT,
  SAATRI_ITABERABA_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/itaberaba-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(ITABERABA_CITY_CODE).toBe("2914703");
    expect(SAATRI_ITABERABA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-itaberaba.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_ITABERABA_PRODUCTION_ENDPOINT).toBe(
      "https://itaberaba.saatri.com.br/servicos/nfse.svc",
    );
    expect(itaberabaSaatriManifest.id).toBe("itaberaba-saatri");
    expect(itaberabaSaatriManifest.name).toBe("SAATRI Itaberaba-BA (NFS-e ABRASF 2.03)");
    expect(itaberabaSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(itaberabaSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      itaberabaSaatriManifest.capabilityMetadata?.find(
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
          createItaberabaSaatriProviderLayer(
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

      expect(providerId).toBe("itaberaba-saatri");
    }),
  );
});

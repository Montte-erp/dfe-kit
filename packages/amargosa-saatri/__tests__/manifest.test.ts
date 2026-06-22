import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createAmargosaSaatriProviderLayer,
  AMARGOSA_CITY_CODE,
  amargosaSaatriManifest,
  SAATRI_AMARGOSA_HOMOLOGATION_ENDPOINT,
  SAATRI_AMARGOSA_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/amargosa-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(AMARGOSA_CITY_CODE).toBe("2901007");
    expect(SAATRI_AMARGOSA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-amargosa.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_AMARGOSA_PRODUCTION_ENDPOINT).toBe(
      "https://amargosa.saatri.com.br/servicos/nfse.svc",
    );
    expect(amargosaSaatriManifest.id).toBe("amargosa-saatri");
    expect(amargosaSaatriManifest.name).toBe("SAATRI Amargosa-BA (NFS-e ABRASF 2.03)");
    expect(amargosaSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(amargosaSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      amargosaSaatriManifest.capabilityMetadata?.find(
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
          createAmargosaSaatriProviderLayer(
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

      expect(providerId).toBe("amargosa-saatri");
    }),
  );
});

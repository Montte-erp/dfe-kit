import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createSerraDoRamalhoSaatriProviderLayer,
  SERRA_DO_RAMALHO_CITY_CODE,
  serraDoRamalhoSaatriManifest,
  SAATRI_SERRA_DO_RAMALHO_HOMOLOGATION_ENDPOINT,
  SAATRI_SERRA_DO_RAMALHO_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/serra-do-ramalho-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(SERRA_DO_RAMALHO_CITY_CODE).toBe("2930154");
    expect(SAATRI_SERRA_DO_RAMALHO_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-serradoramalho.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_SERRA_DO_RAMALHO_PRODUCTION_ENDPOINT).toBe(
      "https://serradoramalho.saatri.com.br/servicos/nfse.svc",
    );
    expect(serraDoRamalhoSaatriManifest.id).toBe("serra-do-ramalho-saatri");
    expect(serraDoRamalhoSaatriManifest.name).toBe(
      "SAATRI Serra do Ramalho-BA (NFS-e ABRASF 2.03)",
    );
    expect(serraDoRamalhoSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(serraDoRamalhoSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      serraDoRamalhoSaatriManifest.capabilityMetadata?.find(
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
          createSerraDoRamalhoSaatriProviderLayer(
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

      expect(providerId).toBe("serra-do-ramalho-saatri");
    }),
  );
});

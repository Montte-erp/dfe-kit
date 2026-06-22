import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createMorroDoChapeuSaatriProviderLayer,
  MORRO_DO_CHAPEU_CITY_CODE,
  morroDoChapeuSaatriManifest,
  SAATRI_MORRO_DO_CHAPEU_HOMOLOGATION_ENDPOINT,
  SAATRI_MORRO_DO_CHAPEU_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/morro-do-chapeu-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(MORRO_DO_CHAPEU_CITY_CODE).toBe("2921708");
    expect(SAATRI_MORRO_DO_CHAPEU_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-morrodochapeu.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_MORRO_DO_CHAPEU_PRODUCTION_ENDPOINT).toBe(
      "https://morrodochapeu.saatri.com.br/servicos/nfse.svc",
    );
    expect(morroDoChapeuSaatriManifest.id).toBe("morro-do-chapeu-saatri");
    expect(morroDoChapeuSaatriManifest.name).toBe("SAATRI Morro do Chapéu-BA (NFS-e ABRASF 2.03)");
    expect(morroDoChapeuSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(morroDoChapeuSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      morroDoChapeuSaatriManifest.capabilityMetadata?.find(
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
          createMorroDoChapeuSaatriProviderLayer(
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

      expect(providerId).toBe("morro-do-chapeu-saatri");
    }),
  );
});

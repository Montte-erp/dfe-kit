import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createPojucaSaatriProviderLayer,
  POJUCA_CITY_CODE,
  pojucaSaatriManifest,
  SAATRI_POJUCA_HOMOLOGATION_ENDPOINT,
  SAATRI_POJUCA_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/pojuca-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(POJUCA_CITY_CODE).toBe("2925204");
    expect(SAATRI_POJUCA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-pojuca.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_POJUCA_PRODUCTION_ENDPOINT).toBe(
      "https://pojuca.saatri.com.br/servicos/nfse.svc",
    );
    expect(pojucaSaatriManifest.id).toBe("pojuca-saatri");
    expect(pojucaSaatriManifest.name).toBe("SAATRI Pojuca-BA (NFS-e ABRASF 2.03)");
    expect(pojucaSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(pojucaSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      pojucaSaatriManifest.capabilityMetadata?.find(
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
          createPojucaSaatriProviderLayer(
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

      expect(providerId).toBe("pojuca-saatri");
    }),
  );
});

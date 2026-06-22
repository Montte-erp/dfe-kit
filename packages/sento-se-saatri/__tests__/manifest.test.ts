import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createSentoSeSaatriProviderLayer,
  SENTO_SE_CITY_CODE,
  sentoSeSaatriManifest,
  SAATRI_SENTO_SE_HOMOLOGATION_ENDPOINT,
  SAATRI_SENTO_SE_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/sento-se-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(SENTO_SE_CITY_CODE).toBe("2930204");
    expect(SAATRI_SENTO_SE_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-sentose.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_SENTO_SE_PRODUCTION_ENDPOINT).toBe(
      "https://sentose.saatri.com.br/servicos/nfse.svc",
    );
    expect(sentoSeSaatriManifest.id).toBe("sento-se-saatri");
    expect(sentoSeSaatriManifest.name).toBe("SAATRI Sento Sé-BA (NFS-e ABRASF 2.03)");
    expect(sentoSeSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(sentoSeSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      sentoSeSaatriManifest.capabilityMetadata?.find(
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
          createSentoSeSaatriProviderLayer(
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

      expect(providerId).toBe("sento-se-saatri");
    }),
  );
});

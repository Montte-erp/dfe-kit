import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createSaoFranciscoDoCondeSaatriProviderLayer,
  SAO_FRANCISCO_DO_CONDE_CITY_CODE,
  saoFranciscoDoCondeSaatriManifest,
  SAATRI_SAO_FRANCISCO_DO_CONDE_HOMOLOGATION_ENDPOINT,
  SAATRI_SAO_FRANCISCO_DO_CONDE_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/sao-francisco-do-conde-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(SAO_FRANCISCO_DO_CONDE_CITY_CODE).toBe("2929206");
    expect(SAATRI_SAO_FRANCISCO_DO_CONDE_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-sfconde.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_SAO_FRANCISCO_DO_CONDE_PRODUCTION_ENDPOINT).toBe(
      "https://sfconde.saatri.com.br/servicos/nfse.svc",
    );
    expect(saoFranciscoDoCondeSaatriManifest.id).toBe("sao-francisco-do-conde-saatri");
    expect(saoFranciscoDoCondeSaatriManifest.name).toBe(
      "SAATRI São Francisco do Conde-BA (NFS-e ABRASF 2.03)",
    );
    expect(saoFranciscoDoCondeSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(saoFranciscoDoCondeSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      saoFranciscoDoCondeSaatriManifest.capabilityMetadata?.find(
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
          createSaoFranciscoDoCondeSaatriProviderLayer(
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

      expect(providerId).toBe("sao-francisco-do-conde-saatri");
    }),
  );
});

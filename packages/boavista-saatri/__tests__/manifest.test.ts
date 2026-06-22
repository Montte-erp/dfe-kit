import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createBoavistaSaatriProviderLayer,
  BOAVISTA_CITY_CODE,
  boavistaSaatriManifest,
  SAATRI_BOAVISTA_HOMOLOGATION_ENDPOINT,
  SAATRI_BOAVISTA_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/boavista-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(BOAVISTA_CITY_CODE).toBe("1400100");
    expect(SAATRI_BOAVISTA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-boavista.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_BOAVISTA_PRODUCTION_ENDPOINT).toBe(
      "https://boavista.saatri.com.br/servicos/nfse.svc",
    );
    expect(boavistaSaatriManifest.id).toBe("boavista-saatri");
    expect(boavistaSaatriManifest.name).toBe("SAATRI Boa Vista-RR (NFS-e ABRASF 2.03)");
    expect(boavistaSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(boavistaSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      boavistaSaatriManifest.capabilityMetadata?.find(
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
          createBoavistaSaatriProviderLayer(
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

      expect(providerId).toBe("boavista-saatri");
    }),
  );
});

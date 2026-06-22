import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Redacted } from "effect";
import {
  createIpiraSaatriProviderLayer,
  IPIRA_CITY_CODE,
  ipiraSaatriManifest,
  SAATRI_IPIRA_HOMOLOGATION_ENDPOINT,
  SAATRI_IPIRA_PRODUCTION_ENDPOINT,
} from "../src/index";

describe("@dfe-kit/ipira-saatri", () => {
  it("lista identidade, endpoints e capabilities do município", () => {
    expect(IPIRA_CITY_CODE).toBe("2914000");
    expect(SAATRI_IPIRA_HOMOLOGATION_ENDPOINT).toBe(
      "https://homologa-ipira.saatri.com.br/servicos/nfse.svc",
    );
    expect(SAATRI_IPIRA_PRODUCTION_ENDPOINT).toBe("https://ipira.saatri.com.br/servicos/nfse.svc");
    expect(ipiraSaatriManifest.id).toBe("ipira-saatri");
    expect(ipiraSaatriManifest.name).toBe("SAATRI Ipirá-BA (NFS-e ABRASF 2.03)");
    expect(ipiraSaatriManifest.documentKinds).toEqual(["nfse"]);
    expect(ipiraSaatriManifest.capabilities).toEqual(["issue_nfse"]);
    expect(
      ipiraSaatriManifest.capabilityMetadata?.find(
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
          createIpiraSaatriProviderLayer(
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

      expect(providerId).toBe("ipira-saatri");
    }),
  );
});

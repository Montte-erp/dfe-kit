import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import {
  createSaatriProviderWithHttpServiceFromConfig,
  SaatriHttpClient,
  saatriMunicipalityCatalog,
} from "../src/index";
import type { SaatriEventName } from "../src/index";
import {
  createMunicipalNfseInput,
  createSaatriAuthorizedResponse,
  integrationCredentials,
} from "./fixtures";

describe("integração SAATRI por município", () => {
  for (const municipality of saatriMunicipalityCatalog) {
    it.effect(
      `emite NFS-e ${municipality.cityName}-${municipality.state} sem tocar rede real`,
      () =>
        Effect.gen(function* () {
          const input = createMunicipalNfseInput(municipality);
          const emittedEvents: SaatriEventName[] = [];
          let capturedEndpoint = "";
          let capturedSoapAction = "";
          let capturedEnvelope = "";
          const http = {
            postSoap: (args: {
              readonly endpoint: string;
              readonly soapAction: string;
              readonly envelope: string;
            }) => {
              const { endpoint, soapAction, envelope } = args;
              capturedEndpoint = endpoint;
              capturedSoapAction = soapAction;
              capturedEnvelope = envelope;
              return Effect.succeed(
                createSaatriAuthorizedResponse(
                  input.number,
                  `PROTO-${municipality.config.cityCode}`,
                ),
              );
            },
          };
          const provider = createSaatriProviderWithHttpServiceFromConfig(
            municipality.config,
            integrationCredentials,
            {
              environment: "homologation",
              correlationId: `integration-${municipality.config.providerId}`,
              eventSink: (event) =>
                Effect.sync(() => {
                  emittedEvents.push(event.name);
                }),
            },
          );

          const issued = yield* provider
            .issue(input)
            .pipe(Effect.provide(Layer.succeed(SaatriHttpClient, http)));

          expect(capturedEndpoint).toBe(municipality.config.endpoints.homologation);
          expect(capturedSoapAction).toBe("http://nfse.abrasf.org.br/Infse/GerarNfse");
          expect(capturedEnvelope).toContain(
            `<CodigoMunicipio>${municipality.config.cityCode}</CodigoMunicipio>`,
          );
          expect(capturedEnvelope).toContain("<ItemListaServico>010101</ItemListaServico>");
          expect(capturedEnvelope).toContain("<CodigoNbs>123456789</CodigoNbs>");
          expect(issued.documentRef).toEqual({
            documentKind: "nfse",
            providerId: municipality.config.providerId,
            environment: "homologation",
            issuerTaxId: integrationCredentials.issuerCnpj,
            series: input.series,
            number: input.number,
          });
          expect(issued.providerResponse.status).toBe("authorized");
          expect(issued.providerResponse.providerDocumentId).toBe(input.number);
          expect(issued.providerResponse.protocol).toBe(`PROTO-${municipality.config.cityCode}`);
          expect(issued.providerResponse.artifacts.map((artifact) => artifact.kind)).toEqual([
            "request_xml",
            "response_xml",
            "authorized_xml",
          ]);
          expect(emittedEvents).toContain("saatri.http.post.started");
          expect(emittedEvents).toContain("saatri.fiscal.authorized");
        }),
    );
  }
});

import { describe, expect, it } from "@effect/vitest";
import { FiscalProviderService } from "@dfe-kit/fiscal";
import { Effect, Layer } from "effect";
import {
  createSefazHttpClientLayerFromClient,
  createSefazProviderLayerFromManifest,
  createSefazStateManifest,
  sefazStatePortalCatalog,
} from "../src/index";
import type { SefazHttpClient } from "../src/index";
import {
  createSefazAuthorizedResponse,
  createStateAuthorizationEndpoint,
  createStateFiscalDocumentInput,
} from "./fixtures";

describe("integração SEFAZ por estado", () => {
  for (const portal of sefazStatePortalCatalog) {
    for (const documentKind of portal.documentKinds) {
      it.effect(
        `emite ${documentKind.toUpperCase()} ${portal.state} com endpoint estadual injetado`,
        () =>
          Effect.gen(function* () {
            const endpoint = createStateAuthorizationEndpoint(portal.state, documentKind);
            const input = createStateFiscalDocumentInput(portal.state, documentKind);
            const authorizationEndpoints =
              documentKind === "nfe" ? { nfe: endpoint } : { nfce: endpoint };
            let capturedEndpoint = "";
            let capturedRequestXml = "";
            let builderSawState = "";
            let builderSawKind = "";
            const http: SefazHttpClient = {
              postAuthorizationXml: ({ endpoint: requestEndpoint, requestXml }) => {
                capturedEndpoint = requestEndpoint;
                capturedRequestXml = requestXml;
                return Effect.succeed({
                  status: 200,
                  body: createSefazAuthorizedResponse(documentKind, portal.state),
                });
              },
            };
            const manifest = createSefazStateManifest(portal.state);
            const providerLayer = createSefazProviderLayerFromManifest(manifest, {
              environment: "homologation",
              authorizationEndpoints,
              correlationId: `integration-${portal.state}-${documentKind}`,
              buildSignedRequestXml: (documentInput) => {
                builderSawState = documentInput.issuer.address.state;
                builderSawKind = documentInput.documentKind;
                return Effect.succeed(
                  `<enviNFe><UF>${documentInput.issuer.address.state}</UF><Modelo>${documentInput.documentKind === "nfe" ? "55" : "65"}</Modelo></enviNFe>`,
                );
              },
            }).pipe(Layer.provide(createSefazHttpClientLayerFromClient(http)));

            const issued = yield* Effect.gen(function* () {
              const provider = yield* FiscalProviderService;
              return yield* provider.issue(input);
            }).pipe(Effect.provide(providerLayer));

            expect(builderSawState).toBe(portal.state);
            expect(builderSawKind).toBe(documentKind);
            expect(capturedEndpoint).toBe(endpoint);
            expect(capturedRequestXml).toContain(`<UF>${portal.state}</UF>`);
            expect(capturedRequestXml).toContain(
              `<Modelo>${documentKind === "nfe" ? "55" : "65"}</Modelo>`,
            );
            expect(issued.documentRef.documentKind).toBe(documentKind);
            expect(issued.documentRef.providerId).toBe(manifest.id);
            expect(issued.providerResponse.status).toBe("authorized");
            expect(issued.providerResponse.protocol).toBe(`${portal.state}-PROTO-${documentKind}`);
            expect(issued.providerResponse.artifacts.map((artifact) => artifact.kind)).toEqual([
              "request_xml",
              "response_xml",
              "authorized_xml",
            ]);
          }),
      );
    }
  }
});

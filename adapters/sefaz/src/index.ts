import { FiscalProviderService } from "@dfe-kit/fiscal";
import type {
  FiscalProvider,
  IssueFiscalDocumentInput,
  IssueFiscalDocumentResponse,
} from "@dfe-kit/fiscal";
import { Effect, Layer, Schema } from "effect";
import {
  assertSefazSignedRequestXmlBuilder,
  createSefazProviderOptionsSchema,
  SefazOperationValue,
  SefazPhaseValue,
  SefazProviderError,
  SefazProviderErrorCodeValue,
  SefazSchemaNameValue,
  sefazEnvironmentConfigSchema,
  schemaErrorMetadata,
} from "./config";
import type { CreateSefazProviderOptions } from "./config";
import { createSefazFetchHttpClientLayer, SefazHttpClientService } from "./http";
import type { CreateSefazHttpOptions, SefazHttpClient } from "./http";
import { sefazManifest } from "./manifest";
import { createSefazProvider as createConfiguredSefazProvider } from "./provider";
import type { SefazProviderWithHttpService } from "./provider";

const decodeProviderOptions = (options: CreateSefazProviderOptions) =>
  Schema.decodeUnknownEffect(createSefazProviderOptionsSchema)(options).pipe(
    Effect.mapError(
      (error) =>
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.configError,
          retryable: false,
          reason: "Opções do provider SEFAZ inválidas.",
          operation: SefazOperationValue.schemaDecode,
          phase: SefazPhaseValue.providerOptionsDecode,
          schemaName: SefazSchemaNameValue.providerOptions,
          ...schemaErrorMetadata(error),
        }),
    ),
    Effect.flatMap((decoded) =>
      assertSefazSignedRequestXmlBuilder(decoded.buildSignedRequestXml).pipe(
        Effect.map((buildSignedRequestXml) => ({ ...decoded, buildSignedRequestXml })),
      ),
    ),
  );

const decodeEnvironmentConfig = (
  options: Pick<CreateSefazProviderOptions, "environment" | "authorizationEndpoints">,
) =>
  Schema.decodeUnknownEffect(sefazEnvironmentConfigSchema)({
    environment: options.environment,
    authorizationEndpoints: options.authorizationEndpoints,
  }).pipe(
    Effect.mapError(
      (error) =>
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.configError,
          retryable: false,
          reason: "Ambiente SEFAZ inválido.",
          operation: SefazOperationValue.schemaDecode,
          phase: SefazPhaseValue.environmentConfigDecode,
          schemaName: SefazSchemaNameValue.environmentConfig,
          ...schemaErrorMetadata(error),
        }),
    ),
  );

const issueWithHttpClient = (
  http: SefazHttpClient,
  manifest: FiscalProvider["manifest"],
  options: CreateSefazProviderOptions,
  input: IssueFiscalDocumentInput,
): Effect.Effect<IssueFiscalDocumentResponse, SefazProviderError> =>
  Effect.gen(function* () {
    const decodedOptions = yield* decodeProviderOptions(options);
    const config = yield* decodeEnvironmentConfig(decodedOptions);
    return yield* createConfiguredSefazProvider({
      manifest,
      config,
      buildSignedRequestXml: decodedOptions.buildSignedRequestXml,
      http,
      eventSink: options.eventSink,
      correlationId: options.correlationId,
    }).issue(input);
  });

export const createSefazProviderFromManifest = (
  manifest: FiscalProvider["manifest"],
  http: SefazHttpClient,
  options: CreateSefazProviderOptions,
): FiscalProvider => ({
  manifest,
  issue: (input) => issueWithHttpClient(http, manifest, options, input),
});

export const createSefazProvider = (
  http: SefazHttpClient,
  options: CreateSefazProviderOptions,
): FiscalProvider => createSefazProviderFromManifest(sefazManifest, http, options);

export const createSefazProviderWithHttpServiceFromManifest = (
  manifest: FiscalProvider["manifest"],
  options: CreateSefazProviderOptions,
): SefazProviderWithHttpService => ({
  manifest,
  issue: (input) =>
    Effect.flatMap(SefazHttpClientService, (http) =>
      issueWithHttpClient(http, manifest, options, input),
    ),
});

export const createSefazProviderWithHttpService = (
  options: CreateSefazProviderOptions,
): SefazProviderWithHttpService =>
  createSefazProviderWithHttpServiceFromManifest(sefazManifest, options);

export const createSefazProviderLayerFromManifestAndHttpClient = (
  manifest: FiscalProvider["manifest"],
  http: SefazHttpClient,
  options: CreateSefazProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createSefazProviderFromManifest(manifest, http, options));

export const createSefazProviderLayerFromHttpClient = (
  http: SefazHttpClient,
  options: CreateSefazProviderOptions,
): Layer.Layer<FiscalProvider> =>
  createSefazProviderLayerFromManifestAndHttpClient(sefazManifest, http, options);

export const createSefazProviderLayerFromManifest = (
  manifest: FiscalProvider["manifest"],
  options: CreateSefazProviderOptions,
): Layer.Layer<FiscalProvider, never, SefazHttpClient> =>
  Layer.effect(
    FiscalProviderService,
    Effect.map(SefazHttpClientService, (http) =>
      createSefazProviderFromManifest(manifest, http, options),
    ),
  );

export const createSefazProviderLayer = (
  options: CreateSefazProviderOptions,
): Layer.Layer<FiscalProvider, never, SefazHttpClient> =>
  createSefazProviderLayerFromManifest(sefazManifest, options);

export const createSefazFetchProviderLayerFromManifest = (
  manifest: FiscalProvider["manifest"],
  options: CreateSefazProviderOptions,
  httpOptions: CreateSefazHttpOptions = {},
): Layer.Layer<FiscalProvider> =>
  createSefazProviderLayerFromManifest(manifest, options).pipe(
    Layer.provide(createSefazFetchHttpClientLayer(httpOptions)),
  );

export const createSefazFetchProviderLayer = (
  options: CreateSefazProviderOptions,
  httpOptions: CreateSefazHttpOptions = {},
): Layer.Layer<FiscalProvider> =>
  createSefazFetchProviderLayerFromManifest(sefazManifest, options, httpOptions);

export { sefazManifest };
export {
  createSefazStateManifest,
  getSefazStatePortalByState,
  getSefazStatePortalsByDocumentKind,
  sefazStatePortalByState,
  sefazStatePortalCatalog,
} from "./catalog";
export {
  createSefazFetchHttpClientLayer,
  createSefazHttpClientConfigLayer,
  createSefazHttpClientLayer,
  createSefazHttpClientLayerFromClient,
  SefazHttpClientService,
} from "./http";
export type { CreateSefazHttpOptions, SefazHttpClient, SefazHttpResponse } from "./http";
export type {
  SefazStateCode,
  SefazStateDocumentKind,
  SefazStatePortalDescriptor,
  SefazStatePortalStatus,
} from "./catalog";
export type { FiscalProvider, FiscalProviderManifest } from "@dfe-kit/fiscal";
export type {
  CreateSefazProviderOptions,
  SefazAuthorizationEndpoints,
  SefazDocumentKind,
  SefazEnvironmentConfig,
  SefazEvent,
  SefazEventName,
  SefazEventSink,
  SefazProviderErrorCode,
  SefazSignedRequestXmlBuilder,
} from "./config";
export {
  SefazEventNameValue,
  SefazOperationValue,
  SefazPhaseValue,
  SefazProviderError,
  SefazProviderErrorCodeValue,
  SefazSchemaNameValue,
} from "./config";
export type { SefazProviderWithHttpService } from "./provider";

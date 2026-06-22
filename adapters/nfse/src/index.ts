import type {
  FiscalProvider,
  IssueFiscalDocumentInput,
  IssueFiscalDocumentResponse,
} from "@dfe-kit/fiscal";
import { Effect, Schema } from "effect";
import {
  assertNfseNacionalDpsBuilder,
  createNfseNacionalProviderOptionsSchema,
  NfseNacionalOperationValue,
  NfseNacionalPhaseValue,
  NfseNacionalProviderError,
  NfseNacionalProviderErrorCodeValue,
  NfseNacionalSchemaNameValue,
  nfseNacionalEnvironmentConfigSchema,
  schemaErrorMetadata,
} from "./config";
import type { CreateNfseNacionalProviderOptions } from "./config";
import { NfseNacionalHttpClientService } from "./http";
import type { NfseNacionalHttpClient } from "./http";
import {
  NFSE_NACIONAL_HOMOLOGATION_ENDPOINT,
  NFSE_NACIONAL_PRODUCTION_ENDPOINT,
  nfseNacionalManifest,
} from "./manifest";
import {
  createNfseMunicipalPortalManifest,
  createNfseMunicipalPortalManifestByProviderId,
  getNfseMunicipalPortalByCityCode,
  getNfseMunicipalPortalByProviderId,
  getNfseMunicipalPortalsByState,
  municipalNfseEndpointForEnvironment,
  nfseMunicipalPortalCatalog,
  nfseMunicipalPortalByProviderId,
  nfseMunicipalPortalStates,
} from "./municipal-catalog";
import { createNfseNacionalProvider as createConfiguredNfseNacionalProvider } from "./provider";
import type { NfseNacionalProviderWithHttpService } from "./provider";

const endpointByEnvironment = {
  homologation: NFSE_NACIONAL_HOMOLOGATION_ENDPOINT,
  production: NFSE_NACIONAL_PRODUCTION_ENDPOINT,
} satisfies Record<"homologation" | "production", string>;

const decodeProviderOptions = (options: CreateNfseNacionalProviderOptions) =>
  Schema.decodeUnknownEffect(createNfseNacionalProviderOptionsSchema)(options).pipe(
    Effect.mapError(
      (error) =>
        new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.configError,
          retryable: false,
          reason: "Opções do provider NFS-e Nacional inválidas.",
          operation: NfseNacionalOperationValue.schemaDecode,
          phase: NfseNacionalPhaseValue.providerOptionsDecode,
          schemaName: NfseNacionalSchemaNameValue.providerOptions,
          ...schemaErrorMetadata(error),
        }),
    ),
    Effect.flatMap((decoded) =>
      assertNfseNacionalDpsBuilder(decoded.buildDpsXml).pipe(
        Effect.map((buildDpsXml) => ({ ...decoded, buildDpsXml })),
      ),
    ),
  );

const decodeEnvironmentConfig = (environment: "homologation" | "production") =>
  Schema.decodeUnknownEffect(nfseNacionalEnvironmentConfigSchema)({
    environment,
    endpoint: endpointByEnvironment[environment],
  }).pipe(
    Effect.mapError(
      (error) =>
        new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.configError,
          retryable: false,
          reason: "Ambiente NFS-e Nacional inválido.",
          operation: NfseNacionalOperationValue.schemaDecode,
          phase: NfseNacionalPhaseValue.environmentConfigDecode,
          schemaName: NfseNacionalSchemaNameValue.environmentConfig,
          ...schemaErrorMetadata(error),
        }),
    ),
  );

const issueWithHttpClient = (
  http: NfseNacionalHttpClient,
  options: CreateNfseNacionalProviderOptions,
  input: IssueFiscalDocumentInput,
): Effect.Effect<IssueFiscalDocumentResponse, NfseNacionalProviderError> =>
  Effect.gen(function* () {
    const decodedOptions = yield* decodeProviderOptions(options);
    const config = yield* decodeEnvironmentConfig(decodedOptions.environment);
    return yield* createConfiguredNfseNacionalProvider({
      manifest: nfseNacionalManifest,
      config,
      buildDpsXml: decodedOptions.buildDpsXml,
      http,
      eventSink: options.eventSink,
      correlationId: options.correlationId,
    }).issue(input);
  });

export const createNfseNacionalProvider = (
  http: NfseNacionalHttpClient,
  options: CreateNfseNacionalProviderOptions,
): FiscalProvider => ({
  manifest: nfseNacionalManifest,
  issue: (input) => issueWithHttpClient(http, options, input),
});

export const createNfseNacionalProviderWithHttpService = (
  options: CreateNfseNacionalProviderOptions,
): NfseNacionalProviderWithHttpService => ({
  manifest: nfseNacionalManifest,
  issue: (input) =>
    Effect.flatMap(NfseNacionalHttpClientService, (http) =>
      issueWithHttpClient(http, options, input),
    ),
});

export {
  NFSE_NACIONAL_HOMOLOGATION_ENDPOINT,
  NFSE_NACIONAL_PRODUCTION_ENDPOINT,
  nfseNacionalManifest,
};
export {
  createNfseMunicipalPortalManifest,
  createNfseMunicipalPortalManifestByProviderId,
  getNfseMunicipalPortalByCityCode,
  getNfseMunicipalPortalByProviderId,
  getNfseMunicipalPortalsByState,
  municipalNfseEndpointForEnvironment,
  nfseMunicipalPortalCatalog,
  nfseMunicipalPortalByProviderId,
  nfseMunicipalPortalStates,
};
export {
  createNfseNacionalHttpClientConfigLayer,
  createNfseNacionalHttpClientLayer,
  createNfseNacionalHttpClientLayerFromClient,
  NfseNacionalHttpClientService,
} from "./http";
export type {
  CreateNfseNacionalHttpOptions,
  NfseNacionalHttpClient,
  NfseNacionalHttpResponse,
} from "./http";
export type {
  NfseMunicipalPortalDescriptor,
  NfseMunicipalPortalEndpoints,
  NfseMunicipalPortalFamily,
  NfseMunicipalPortalId,
  NfseMunicipalPortalState,
} from "./municipal-catalog";
export type { FiscalProvider, FiscalProviderManifest } from "@dfe-kit/fiscal";
export type {
  CreateNfseNacionalProviderOptions,
  NfseNacionalDpsXmlBuilder,
  NfseNacionalEnvironmentConfig,
  NfseNacionalEvent,
  NfseNacionalEventName,
  NfseNacionalEventSink,
  NfseNacionalProviderError,
  NfseNacionalProviderErrorCode,
} from "./config";
export type { NfseNacionalProviderWithHttpService } from "./provider";

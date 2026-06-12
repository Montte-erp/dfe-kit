import type {
  FiscalProvider,
  FiscalProviderManifest,
  IssueFiscalDocumentInput,
  IssueFiscalDocumentResponse,
} from "@dfe-kit/fiscal";
import { Effect, Schema } from "effect";
import {
  createSaatriPackageProviderOptionsSchema,
  type CreateSaatriPackageProviderOptions,
  SaatriOperationValue,
  SaatriPhaseValue,
  SaatriProviderError,
  SaatriProviderErrorCodeValue,
  SaatriSchemaNameValue,
  schemaErrorMetadata,
  saatriCredentialsSchema,
  saatriEnvironmentConfigSchema,
  saatriProviderPackageConfigSchema,
  SAATRI_ABRASF_VERSION,
  type GerarNfseSigner,
  type SaatriCredentials,
  type SaatriEnvironmentConfig,
  type SaatriProviderPackageConfig,
} from "./config";
import { configureSaatriManifest } from "./manifest";
import { buildGerarNfseEnvelope, SOAP_ACTION_GERAR_NFSE } from "./envelope";
import {
  createSaatriFetchHttpClientLayer,
  createSaatriHttpClientLayer,
  type CreateSaatriHttpOptions,
  SaatriHttpClient,
} from "./http";
import { parseGerarNfseResponse } from "./parse";
import { createSaatriProvider, createSaatriProviderWithHttpService } from "./provider";
import type { SaatriProviderWithHttpService } from "./provider";
import { createSaatriHttpClient, withSaatriFetchHttpClient } from "./runtime";

export type ConfiguredSaatriProviderPackage = {
  manifest: FiscalProviderManifest;
  createProvider(
    credentials: SaatriCredentials,
    options: CreateSaatriPackageProviderOptions,
  ): FiscalProvider;
  createProviderWithHttpService(
    credentials: SaatriCredentials,
    options: CreateSaatriPackageProviderOptions,
  ): SaatriProviderWithHttpService;
};

export const configureSaatriProviderPackage = (
  packageConfig: SaatriProviderPackageConfig,
): ConfiguredSaatriProviderPackage => {
  const manifest = configureSaatriManifest({
    providerId: packageConfig.providerId,
    providerName: packageConfig.providerName,
    extraCapabilityMetadata: packageConfig.extraCapabilityMetadata,
  });
  const runtimePackageConfig = {
    providerId: packageConfig.providerId,
    providerName: packageConfig.providerName,
    cityCode: packageConfig.cityCode,
    endpoints: packageConfig.endpoints,
  };
  const issueWithHttpService = (
    credentials: SaatriCredentials,
    options: CreateSaatriPackageProviderOptions,
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, SaatriProviderError, SaatriHttpClient> =>
    Effect.gen(function* () {
      const parsedPackageConfig = yield* Schema.decodeUnknownEffect(
        saatriProviderPackageConfigSchema,
      )(runtimePackageConfig).pipe(
        Effect.mapError(
          (error) =>
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.configError,
              retryable: false,
              reason: "Configuração do pacote SAATRI inválida.",
              operation: SaatriOperationValue.schemaDecode,
              phase: SaatriPhaseValue.packageConfigDecode,
              schemaName: SaatriSchemaNameValue.providerPackageConfig,
              ...schemaErrorMetadata(error),
            }),
        ),
      );
      const parsedCredentials = yield* Schema.decodeUnknownEffect(saatriCredentialsSchema)(
        credentials,
      ).pipe(
        Effect.mapError(
          (error) =>
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.configError,
              retryable: false,
              reason: "Credenciais SAATRI inválidas.",
              operation: SaatriOperationValue.schemaDecode,
              phase: SaatriPhaseValue.credentialsDecode,
              schemaName: SaatriSchemaNameValue.credentials,
              ...schemaErrorMetadata(error),
            }),
        ),
      );
      const parsedOptions = yield* Schema.decodeUnknownEffect(
        createSaatriPackageProviderOptionsSchema,
      )(options).pipe(
        Effect.mapError(
          (error) =>
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.configError,
              retryable: false,
              reason: "Opções do provider SAATRI inválidas.",
              operation: SaatriOperationValue.schemaDecode,
              phase: SaatriPhaseValue.providerOptionsDecode,
              schemaName: SaatriSchemaNameValue.packageProviderOptions,
              ...schemaErrorMetadata(error),
            }),
        ),
      );
      const config: SaatriEnvironmentConfig = {
        environment: parsedOptions.environment,
        endpoint: parsedPackageConfig.endpoints[parsedOptions.environment],
        cityCode: parsedPackageConfig.cityCode,
      };
      const parsedConfig = yield* Schema.decodeUnknownEffect(saatriEnvironmentConfigSchema)(
        config,
      ).pipe(
        Effect.mapError(
          (error) =>
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.configError,
              retryable: false,
              reason: "Ambiente SAATRI inválido.",
              operation: SaatriOperationValue.schemaDecode,
              phase: SaatriPhaseValue.environmentConfigDecode,
              schemaName: SaatriSchemaNameValue.environmentConfig,
              ...schemaErrorMetadata(error),
            }),
        ),
      );

      return yield* createSaatriProviderWithHttpService({
        manifest,
        config: parsedConfig,
        credentials: parsedCredentials,
        signer: options.signer,
        eventSink: options.eventSink,
        correlationId: options.correlationId,
      }).issue(input);
    });

  return {
    manifest,
    createProviderWithHttpService: (credentials, options) => ({
      manifest,
      issue: (input) => issueWithHttpService(credentials, options, input),
    }),
    createProvider: (credentials, options) => ({
      manifest,
      issue: (input) =>
        Effect.gen(function* () {
          const parsedOptions = yield* Schema.decodeUnknownEffect(
            createSaatriPackageProviderOptionsSchema,
          )(options).pipe(
            Effect.mapError(
              (error) =>
                new SaatriProviderError({
                  code: SaatriProviderErrorCodeValue.configError,
                  retryable: false,
                  reason: "Opções do provider SAATRI inválidas.",
                  operation: SaatriOperationValue.schemaDecode,
                  phase: SaatriPhaseValue.providerOptionsDecode,
                  schemaName: SaatriSchemaNameValue.packageProviderOptions,
                  ...schemaErrorMetadata(error),
                }),
            ),
          );
          return yield* withSaatriFetchHttpClient(
            issueWithHttpService(credentials, options, input),
            {
              ...parsedOptions,
              retryableStatus:
                parsedOptions.retryableStatus === undefined
                  ? undefined
                  : new Set(parsedOptions.retryableStatus),
            },
          );
        }),
    }),
  };
};

export {
  buildGerarNfseEnvelope,
  configureSaatriManifest,
  createSaatriFetchHttpClientLayer,
  createSaatriHttpClient,
  createSaatriHttpClientLayer,
  createSaatriProvider,
  createSaatriProviderWithHttpService,
  parseGerarNfseResponse,
  SAATRI_ABRASF_VERSION,
  SOAP_ACTION_GERAR_NFSE,
  withSaatriFetchHttpClient,
};
export { SaatriHttpClient };
export type { CreateSaatriHttpOptions, GerarNfseSigner };
export type {
  CreateSaatriPackageProviderOptions,
  GenerateNfseErrorResponse,
  GenerateNfseOutputDocument,
  GenerateNfseResponse,
  GenerateNfseSoapDocument,
  GenerateNfseSuccessResponse,
  ReturnMessage,
  SaatriCredentials,
  SaatriEnvironmentConfig,
  SaatriEvent,
  SaatriEventName,
  SaatriEventSink,
  SaatriProviderError,
  SaatriProviderErrorCode,
  SaatriProviderPackageConfig,
  SaatriSoapHeader,
} from "./config";
export {
  SaatriEventNameValue,
  SaatriFiscalRejection,
  SaatriOperationValue,
  SaatriPhaseValue,
  SaatriProviderErrorCodeValue,
  SaatriSchemaNameValue,
} from "./config";
export {
  SaatriAttributeNameValue,
  SaatriMetricNameValue,
  SaatriSpanNameValue,
  saatriFiscalStatusTotal,
  saatriHttpAttemptTotal,
  saatriHttpRetryTotal,
  saatriHttpStatusTotal,
  saatriIssueErrorTotal,
  saatriIssueTotal,
  saatriParseErrorTotal,
  saatriXmlBytes,
} from "./observability";
export type { SaatriAttributeName, SaatriMetricName, SaatriSpanName } from "./observability";
export type { SaatriProviderWithHttpService } from "./provider";

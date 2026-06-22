import {
  FiscalArtifactKindValue,
  FiscalDocumentKindValue,
  FiscalDocumentStatusValue,
} from "@dfe-kit/fiscal";
import type {
  FiscalArtifact,
  FiscalDocumentRef,
  FiscalProviderManifest,
  FiscalRejection,
  IssueFiscalDocumentInput,
  IssueFiscalDocumentResponse,
} from "@dfe-kit/fiscal";
import { encodeUtf8, getUtf8ByteLength, XML_MEDIA_TYPE } from "@dfe-kit/xml";
import { Effect, Metric } from "effect";
import {
  buildGerarNfseEnvelope,
  SOAP_ACTION_GERAR_NFSE,
  type GerarNfseIssuePayload,
} from "./envelope";
import { SaatriHttpClient as SaatriHttpClientService, type SaatriHttpClient } from "./http";
import { parseGerarNfseResponse } from "./parse";
import {
  SaatriEventNameValue,
  SaatriFiscalRejection,
  SaatriProviderError,
  SaatriProviderErrorCodeValue,
} from "./config";
import type {
  GerarNfseSigner,
  SaatriCredentials,
  SaatriEnvironmentConfig,
  SaatriEventName,
  SaatriEventSink,
} from "./config";
import {
  SaatriAttributeNameValue,
  SaatriSpanNameValue,
  saatriFiscalStatusTotal,
  saatriIssueErrorTotal,
  saatriIssueTotal,
} from "./observability";

const SAATRI_XML_SIZE_LIMIT_BYTES = 512 * 1024;

const emit = (
  sink: SaatriEventSink | undefined,
  name: SaatriEventName,
  input: IssueFiscalDocumentInput,
  providerId: string,
  config: SaatriEnvironmentConfig,
  correlationId: string | undefined,
): Effect.Effect<void> =>
  sink === undefined
    ? Effect.void
    : sink({
        name,
        providerId,
        documentKind: input.documentKind,
        environment: input.environment,
        cityCode: config.cityCode,
        series: input.series,
        number: input.number,
        ...(correlationId !== undefined ? { correlationId } : {}),
      });

const buildDocumentRef = (
  input: IssueFiscalDocumentInput,
  credentials: SaatriCredentials,
  providerId: string,
): FiscalDocumentRef => ({
  documentKind: FiscalDocumentKindValue.nfse,
  providerId,
  environment: input.environment,
  issuerTaxId: credentials.issuerCnpj,
  series: input.series,
  number: input.number,
});

const xmlArtifact = (xml: string): FiscalArtifact => ({
  kind: FiscalArtifactKindValue.requestXml,
  mediaType: XML_MEDIA_TYPE,
  bytes: encodeUtf8(xml),
});

const isGerarNfseIssuePayload = (input: IssueFiscalDocumentInput): input is GerarNfseIssuePayload =>
  input.documentKind === FiscalDocumentKindValue.nfse && input.services !== undefined;

const validateSaatriIssueInput = (
  input: IssueFiscalDocumentInput,
): Effect.Effect<
  { readonly input: GerarNfseIssuePayload; readonly rejections: readonly FiscalRejection[] },
  SaatriProviderError
> => {
  if (!isGerarNfseIssuePayload(input)) {
    return Effect.fail(
      new SaatriProviderError({
        code: SaatriProviderErrorCodeValue.invalidInput,
        retryable: false,
        reason: "SAATRI aceita apenas NFS-e com services[] preenchido.",
      }),
    );
  }

  return Effect.sync(() => {
    const firstInvalidServiceList = input.services.find(
      (service) => service.serviceListCode.length > 8,
    );
    const firstMissingNbs = input.services.find(
      (service) => service.nbsCode === undefined || service.nbsCode.trim() === "",
    );
    const serviceListRejection: readonly FiscalRejection[] =
      firstInvalidServiceList === undefined ? [] : [SaatriFiscalRejection.serviceListCodeMaxLength];
    const nbsRejection: readonly FiscalRejection[] =
      firstMissingNbs === undefined ? [] : [SaatriFiscalRejection.nbsRequired2026];
    return { input, rejections: [...serviceListRejection, ...nbsRejection] };
  });
};

export type SaatriProviderDeps = {
  readonly manifest: FiscalProviderManifest;
  readonly http: SaatriHttpClient;
  readonly config: SaatriEnvironmentConfig;
  readonly credentials: SaatriCredentials;
  readonly signer?: GerarNfseSigner | undefined;
  readonly eventSink?: SaatriEventSink | undefined;
  readonly correlationId?: string | undefined;
};

export type SaatriProvider = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, SaatriProviderError>;
};

type SaatriProviderWithHttpServiceDeps = Omit<SaatriProviderDeps, "http">;

export type SaatriProviderWithHttpService = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, SaatriProviderError, SaatriHttpClient>;
};

export const createSaatriProviderWithHttpService = (
  deps: SaatriProviderWithHttpServiceDeps,
): SaatriProviderWithHttpService => ({
  manifest: deps.manifest,
  issue: (input) =>
    Effect.flatMap(SaatriHttpClientService, (http) =>
      createSaatriProvider({ ...deps, http }).issue(input),
    ),
});

export const createSaatriProvider = (deps: SaatriProviderDeps): SaatriProvider => {
  const { manifest, http, signer, eventSink, correlationId } = deps;

  return {
    manifest,
    issue: (input): Effect.Effect<IssueFiscalDocumentResponse, SaatriProviderError> => {
      const spanAttributes = {
        [SaatriAttributeNameValue.providerId]: manifest.id,
        [SaatriAttributeNameValue.documentKind]: input.documentKind,
        [SaatriAttributeNameValue.environment]: input.environment,
        [SaatriAttributeNameValue.cityCode]: deps.config.cityCode,
        [SaatriAttributeNameValue.documentSeries]: input.series,
        [SaatriAttributeNameValue.documentNumber]: input.number,
        ...(correlationId !== undefined
          ? { [SaatriAttributeNameValue.correlationId]: correlationId }
          : {}),
      };

      return Effect.gen(function* () {
        const credentials = deps.credentials;
        const config = deps.config;
        const documentRef = buildDocumentRef(input, credentials, manifest.id);
        yield* Metric.update(
          Metric.withAttributes(saatriIssueTotal, {
            provider_id: manifest.id,
            environment: input.environment,
          }),
          1,
        );
        yield* Effect.logInfo(SaatriEventNameValue.issueStarted, spanAttributes);
        yield* emit(
          eventSink,
          SaatriEventNameValue.issueStarted,
          input,
          manifest.id,
          config,
          correlationId,
        );
        if (signer === undefined) {
          yield* emit(
            eventSink,
            SaatriEventNameValue.optionalSignerNotConfigured,
            input,
            manifest.id,
            config,
            correlationId,
          );
        }

        const validation = yield* validateSaatriIssueInput(input);

        yield* emit(
          eventSink,
          SaatriEventNameValue.envelopeBuildStarted,
          input,
          manifest.id,
          config,
          correlationId,
        );
        const envelope = yield* buildGerarNfseEnvelope(validation.input, credentials, config, {
          signer,
        }).pipe(
          Effect.withSpan(SaatriSpanNameValue.envelopeBuild, { attributes: spanAttributes }),
          Effect.tapError(() =>
            emit(
              eventSink,
              SaatriEventNameValue.envelopeBuildFailed,
              input,
              manifest.id,
              config,
              correlationId,
            ),
          ),
        );
        yield* emit(
          eventSink,
          SaatriEventNameValue.envelopeBuildSucceeded,
          input,
          manifest.id,
          config,
          correlationId,
        );

        if (getUtf8ByteLength(envelope) > SAATRI_XML_SIZE_LIMIT_BYTES) {
          yield* emit(
            eventSink,
            SaatriEventNameValue.envelopeBuildFailed,
            input,
            manifest.id,
            config,
            correlationId,
          );
          return yield* Effect.fail(
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.xmlSizeLimitExceeded,
              retryable: false,
            }),
          );
        }

        if (validation.rejections.length > 0) {
          yield* emit(
            eventSink,
            SaatriEventNameValue.fiscalRejected,
            input,
            manifest.id,
            config,
            correlationId,
          );
          return {
            documentRef,
            providerResponse: {
              status: FiscalDocumentStatusValue.rejected,
              rejections: validation.rejections,
              artifacts: [xmlArtifact(envelope)],
            },
          };
        }

        yield* emit(
          eventSink,
          SaatriEventNameValue.httpPostStarted,
          input,
          manifest.id,
          config,
          correlationId,
        );
        const responseXml = yield* http
          .postSoap({
            endpoint: config.endpoint,
            soapAction: SOAP_ACTION_GERAR_NFSE,
            envelope,
          })
          .pipe(
            Effect.tapError(() =>
              emit(
                eventSink,
                SaatriEventNameValue.httpPostFailed,
                input,
                manifest.id,
                config,
                correlationId,
              ),
            ),
          );
        yield* emit(
          eventSink,
          SaatriEventNameValue.httpPostSucceeded,
          input,
          manifest.id,
          config,
          correlationId,
        );

        yield* emit(
          eventSink,
          SaatriEventNameValue.responseParseStarted,
          input,
          manifest.id,
          config,
          correlationId,
        );
        const providerResponse = yield* parseGerarNfseResponse({
          requestXml: envelope,
          responseXml,
        }).pipe(
          Effect.withSpan(SaatriSpanNameValue.responseParse, { attributes: spanAttributes }),
          Effect.tapError(() =>
            emit(
              eventSink,
              SaatriEventNameValue.responseParseFailed,
              input,
              manifest.id,
              config,
              correlationId,
            ),
          ),
        );
        yield* emit(
          eventSink,
          SaatriEventNameValue.responseParseSucceeded,
          input,
          manifest.id,
          config,
          correlationId,
        );
        yield* emit(
          eventSink,
          providerResponse.status === FiscalDocumentStatusValue.rejected
            ? SaatriEventNameValue.fiscalRejected
            : providerResponse.status === FiscalDocumentStatusValue.authorized
              ? SaatriEventNameValue.fiscalAuthorized
              : SaatriEventNameValue.fiscalAcceptedPendingAuthorization,
          input,
          manifest.id,
          config,
          correlationId,
        );
        yield* Effect.logInfo(SaatriEventNameValue.issueCompleted, {
          ...spanAttributes,
          [SaatriAttributeNameValue.documentStatus]: providerResponse.status,
        });

        return {
          documentRef,
          providerResponse,
        };
      }).pipe(
        Effect.tap((response) =>
          Metric.update(
            Metric.withAttributes(saatriFiscalStatusTotal, {
              provider_id: manifest.id,
              environment: input.environment,
              status: response.providerResponse.status,
            }),
            1,
          ),
        ),
        Effect.tapError((error) =>
          Effect.all([
            Metric.update(
              Metric.withAttributes(saatriIssueErrorTotal, {
                provider_id: manifest.id,
                environment: input.environment,
                code: error.code,
                phase: error.phase ?? "unknown",
              }),
              1,
            ),
            Effect.logError(SaatriEventNameValue.issueFailed, {
              ...spanAttributes,
              [SaatriAttributeNameValue.errorCode]: error.code,
              [SaatriAttributeNameValue.errorPhase]: error.phase ?? "unknown",
            }),
          ]),
        ),
        Effect.withSpan(SaatriSpanNameValue.issue, { attributes: spanAttributes }),
      );
    },
  };
};

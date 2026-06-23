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
import { issueFiscalDocumentInputSchema } from "@dfe-kit/fiscal/schemas";
import { encodeUtf8, XML_MEDIA_TYPE } from "@dfe-kit/xml";
import { schemaErrorMetadata } from "@dfe-kit/fiscal/effect-error-metadata";
import { Effect, Schema } from "effect";
import {
  SefazEventNameValue,
  SefazOperationValue,
  SefazPhaseValue,
  SefazProviderError,
  SefazProviderErrorCodeValue,
  SefazSchemaNameValue,
} from "./config";
import type {
  SefazDocumentKind,
  SefazEnvironmentConfig,
  SefazEventName,
  SefazEventSink,
  SefazSignedRequestXmlBuilder,
} from "./config";
import { SefazHttpClientService, type SefazHttpClient, type SefazHttpResponse } from "./http";

const emit = (
  sink: SefazEventSink | undefined,
  name: SefazEventName,
  input: IssueFiscalDocumentInput,
  providerId: string,
  correlationId: string | undefined,
): Effect.Effect<void> =>
  sink === undefined
    ? Effect.void
    : sink({
        name,
        providerId,
        documentKind: input.documentKind,
        environment: input.environment,
        series: input.series,
        number: input.number,
        ...(correlationId !== undefined ? { correlationId } : {}),
      });

const issuerTaxId = (input: IssueFiscalDocumentInput): string =>
  input.issuer.cnpj ?? input.issuer.cpf ?? "";

const buildDocumentRef = (
  input: IssueFiscalDocumentInput,
  providerId: string,
): FiscalDocumentRef => ({
  documentKind: input.documentKind,
  providerId,
  environment: input.environment,
  issuerTaxId: issuerTaxId(input),
  series: input.series,
  number: input.number,
});

const xmlArtifact = (kind: FiscalArtifact["kind"], xml: string): FiscalArtifact => ({
  kind,
  mediaType: XML_MEDIA_TYPE,
  bytes: encodeUtf8(xml),
});

const firstMatch = (input: string, pattern: RegExp): string | undefined => {
  const match = pattern.exec(input);
  const value = match?.[1]?.trim();
  return value === undefined || value.length === 0 ? undefined : value;
};

const responseText = (response: SefazHttpResponse): string => response.body.trim();

const responseStatusCode = (body: string): string | undefined =>
  firstMatch(body, /<cStat>([^<]+)<\/cStat>/i);

const responseStatusMessage = (body: string): string | undefined =>
  firstMatch(body, /<xMotivo>([^<]+)<\/xMotivo>/i);

const isAuthorizedStatus = (statusCode: string | undefined): boolean =>
  statusCode === "100" || statusCode === "150";

const extractFiscalRejection = (body: string): FiscalRejection => ({
  code: responseStatusCode(body) ?? "SEFAZ_REJECTION",
  message: responseStatusMessage(body) ?? "SEFAZ rejeitou a NF-e/NFC-e enviada.",
});

const parseIssueResponse = (input: {
  readonly requestXml: string;
  readonly response: SefazHttpResponse;
}): Effect.Effect<IssueFiscalDocumentResponse["providerResponse"], SefazProviderError> =>
  Effect.gen(function* () {
    const body = responseText(input.response);

    if (body.length === 0) {
      return yield* Effect.fail(
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.responseShapeError,
          retryable: false,
          reason: "Resposta vazia da SEFAZ após envio de autorização.",
          operation: SefazOperationValue.responseParse,
          phase: SefazPhaseValue.responseBody,
        }),
      );
    }

    const statusCode = responseStatusCode(body);
    if (isAuthorizedStatus(statusCode)) {
      const providerDocumentId = firstMatch(body, /<chNFe>([^<]+)<\/chNFe>/i);
      const protocol = firstMatch(body, /<nProt>([^<]+)<\/nProt>/i);
      return {
        status: FiscalDocumentStatusValue.authorized,
        ...(providerDocumentId !== undefined ? { providerDocumentId } : {}),
        ...(protocol !== undefined ? { protocol } : {}),
        rejections: [],
        artifacts: [
          xmlArtifact(FiscalArtifactKindValue.requestXml, input.requestXml),
          xmlArtifact(FiscalArtifactKindValue.responseXml, body),
          xmlArtifact(FiscalArtifactKindValue.authorizedXml, body),
        ],
      };
    }

    if (statusCode !== undefined || responseStatusMessage(body) !== undefined) {
      return {
        status: FiscalDocumentStatusValue.rejected,
        rejections: [extractFiscalRejection(body)],
        artifacts: [
          xmlArtifact(FiscalArtifactKindValue.requestXml, input.requestXml),
          xmlArtifact(FiscalArtifactKindValue.responseXml, body),
        ],
      };
    }

    return yield* Effect.fail(
      new SefazProviderError({
        code: SefazProviderErrorCodeValue.responseShapeError,
        retryable: false,
        reason: "Resposta da SEFAZ sem cStat/xMotivo reconhecido.",
        operation: SefazOperationValue.responseParse,
        phase: SefazPhaseValue.responseBody,
      }),
    );
  });

const validateIssueInput = (
  input: IssueFiscalDocumentInput,
  config: SefazEnvironmentConfig,
): Effect.Effect<IssueFiscalDocumentInput, SefazProviderError> =>
  Schema.decodeUnknownEffect(issueFiscalDocumentInputSchema)(input).pipe(
    Effect.mapError(
      (error) =>
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.invalidInput,
          retryable: false,
          reason: "Entrada fiscal inválida para SEFAZ.",
          operation: SefazOperationValue.schemaDecode,
          phase: SefazPhaseValue.issueInputDecode,
          schemaName: SefazSchemaNameValue.issueInput,
          ...schemaErrorMetadata(error),
        }),
    ),
    Effect.flatMap((decoded) => {
      if (
        decoded.documentKind !== FiscalDocumentKindValue.nfe &&
        decoded.documentKind !== FiscalDocumentKindValue.nfce
      ) {
        return Effect.fail(
          new SefazProviderError({
            code: SefazProviderErrorCodeValue.invalidInput,
            retryable: false,
            reason: "Provider SEFAZ aceita apenas documentKind nfe ou nfce.",
            operation: SefazOperationValue.schemaDecode,
            phase: SefazPhaseValue.issueInputValidation,
            schemaName: SefazSchemaNameValue.issueInput,
          }),
        );
      }

      if (decoded.environment !== config.environment) {
        return Effect.fail(
          new SefazProviderError({
            code: SefazProviderErrorCodeValue.invalidInput,
            retryable: false,
            reason: "Ambiente da entrada fiscal diverge do ambiente configurado no provider SEFAZ.",
            operation: SefazOperationValue.schemaDecode,
            phase: SefazPhaseValue.issueInputValidation,
            schemaName: SefazSchemaNameValue.issueInput,
          }),
        );
      }

      return Effect.succeed(decoded);
    }),
  );

const validateRequestXml = (xml: string): Effect.Effect<string, SefazProviderError> => {
  const trimmed = xml.trim();
  return trimmed.length > 0 && trimmed.startsWith("<")
    ? Effect.succeed(trimmed)
    : Effect.fail(
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.requestBuildError,
          retryable: false,
          reason: "buildSignedRequestXml retornou XML/envelope vazio ou inválido.",
          operation: SefazOperationValue.requestBuild,
          phase: SefazPhaseValue.requestXml,
        }),
      );
};

const authorizationEndpoint = (
  config: SefazEnvironmentConfig,
  documentKind: SefazDocumentKind,
): Effect.Effect<string, SefazProviderError> => {
  const endpoint = config.authorizationEndpoints[documentKind];
  return endpoint === undefined
    ? Effect.fail(
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.configError,
          retryable: false,
          reason: `Endpoint de autorização SEFAZ não configurado para ${documentKind}.`,
          operation: SefazOperationValue.schemaDecode,
          phase: SefazPhaseValue.environmentConfigDecode,
          schemaName: SefazSchemaNameValue.environmentConfig,
        }),
      )
    : Effect.succeed(endpoint);
};

export type SefazProviderDeps = {
  readonly manifest: FiscalProviderManifest;
  readonly config: SefazEnvironmentConfig;
  readonly buildSignedRequestXml: SefazSignedRequestXmlBuilder;
  readonly http: SefazHttpClient;
  readonly eventSink?: SefazEventSink | undefined;
  readonly correlationId?: string | undefined;
};

export type SefazProviderWithHttpServiceDeps = Omit<SefazProviderDeps, "http">;

export type SefazProvider = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, SefazProviderError>;
};

export type SefazProviderWithHttpService = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, SefazProviderError, SefazHttpClient>;
};

export const createSefazProviderWithHttpService = (
  deps: SefazProviderWithHttpServiceDeps,
): SefazProviderWithHttpService => ({
  manifest: deps.manifest,
  issue: (input) =>
    Effect.flatMap(SefazHttpClientService, (http) =>
      createSefazProvider({ ...deps, http }).issue(input),
    ),
});

export const createSefazProvider = (deps: SefazProviderDeps): SefazProvider => {
  const { manifest, config, buildSignedRequestXml, http, eventSink, correlationId } = deps;

  return {
    manifest,
    issue: (input): Effect.Effect<IssueFiscalDocumentResponse, SefazProviderError> =>
      Effect.gen(function* () {
        const decodedInput = yield* validateIssueInput(input, config);
        const documentRef = buildDocumentRef(decodedInput, manifest.id);
        const endpoint = yield* authorizationEndpoint(
          config,
          decodedInput.documentKind === FiscalDocumentKindValue.nfe ? "nfe" : "nfce",
        );

        yield* emit(
          eventSink,
          SefazEventNameValue.issueStarted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* emit(
          eventSink,
          SefazEventNameValue.requestBuildStarted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        const requestXml = yield* buildSignedRequestXml(decodedInput).pipe(
          Effect.flatMap(validateRequestXml),
          Effect.tapError(() =>
            emit(
              eventSink,
              SefazEventNameValue.requestBuildFailed,
              decodedInput,
              manifest.id,
              correlationId,
            ),
          ),
        );
        yield* emit(
          eventSink,
          SefazEventNameValue.requestBuildSucceeded,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* emit(
          eventSink,
          SefazEventNameValue.httpPostStarted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        const response = yield* http
          .postAuthorizationXml({ endpoint, requestXml })
          .pipe(
            Effect.tapError(() =>
              emit(
                eventSink,
                SefazEventNameValue.httpPostFailed,
                decodedInput,
                manifest.id,
                correlationId,
              ),
            ),
          );
        yield* emit(
          eventSink,
          SefazEventNameValue.httpPostSucceeded,
          decodedInput,
          manifest.id,
          correlationId,
        );

        const providerResponse = yield* parseIssueResponse({ requestXml, response });
        yield* emit(
          eventSink,
          providerResponse.status === FiscalDocumentStatusValue.rejected
            ? SefazEventNameValue.fiscalRejected
            : SefazEventNameValue.fiscalAuthorized,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* emit(
          eventSink,
          SefazEventNameValue.issueCompleted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* Effect.logInfo(SefazEventNameValue.issueCompleted, {
          provider_id: manifest.id,
          environment: decodedInput.environment,
          document_kind: decodedInput.documentKind,
          status: providerResponse.status,
        });

        return { documentRef, providerResponse };
      }).pipe(
        Effect.tapError((error) =>
          Effect.all([
            emit(eventSink, SefazEventNameValue.issueFailed, input, manifest.id, correlationId),
            Effect.logError(SefazEventNameValue.issueFailed, {
              provider_id: manifest.id,
              code: error.code,
              phase: error.phase ?? "unknown",
            }),
          ]),
        ),
        Effect.withSpan("sefaz.issue", {
          attributes: {
            provider_id: manifest.id,
            environment: input.environment,
            document_kind: input.documentKind,
            document_series: input.series,
            document_number: input.number,
          },
        }),
      ),
  };
};

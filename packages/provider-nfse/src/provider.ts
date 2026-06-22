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
import { Effect, Schema } from "effect";
import {
  NfseNacionalEventNameValue,
  NfseNacionalOperationValue,
  NfseNacionalPhaseValue,
  NfseNacionalProviderError,
  NfseNacionalProviderErrorCodeValue,
  NfseNacionalSchemaNameValue,
  schemaErrorMetadata,
} from "./config";
import type {
  NfseNacionalDpsXmlBuilder,
  NfseNacionalEnvironmentConfig,
  NfseNacionalEventName,
  NfseNacionalEventSink,
} from "./config";
import {
  NfseNacionalHttpClientService,
  type NfseNacionalHttpClient,
  type NfseNacionalHttpResponse,
} from "./http";

const emit = (
  sink: NfseNacionalEventSink | undefined,
  name: NfseNacionalEventName,
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
  documentKind: FiscalDocumentKindValue.nfse,
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

const normalizeResponseText = (response: NfseNacionalHttpResponse): string => response.body.trim();

const looksAuthorized = (body: string): boolean =>
  body.includes("<NFSe") ||
  body.includes("<Nfse") ||
  body.includes("<infNFSe") ||
  body.includes("<InfNFSe");

const looksRejected = (body: string): boolean =>
  /MensagemRetorno|ListaMensagem|rejei|erro|error/i.test(body);

const extractFiscalRejection = (body: string): FiscalRejection => ({
  code:
    firstMatch(body, /<Codigo>([^<]+)<\/Codigo>/i) ??
    firstMatch(body, /"codigo"\s*:\s*"([^"]+)"/i) ??
    "NFSE_NACIONAL_REJECTION",
  message:
    firstMatch(body, /<Mensagem>([^<]+)<\/Mensagem>/i) ??
    firstMatch(body, /<Descricao>([^<]+)<\/Descricao>/i) ??
    firstMatch(body, /"mensagem"\s*:\s*"([^"]+)"/i) ??
    firstMatch(body, /"descricao"\s*:\s*"([^"]+)"/i) ??
    "Sefin Nacional rejeitou a DPS enviada.",
});

const parseIssueResponse = (input: {
  readonly requestXml: string;
  readonly response: NfseNacionalHttpResponse;
}): Effect.Effect<IssueFiscalDocumentResponse["providerResponse"], NfseNacionalProviderError> =>
  Effect.gen(function* () {
    const body = normalizeResponseText(input.response);

    if (body.length === 0) {
      return yield* Effect.fail(
        new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.responseShapeError,
          retryable: false,
          reason: "Resposta vazia da Sefin Nacional após POST /nfse.",
          operation: NfseNacionalOperationValue.responseParse,
          phase: NfseNacionalPhaseValue.responseBody,
        }),
      );
    }

    if (looksRejected(body)) {
      return {
        status: FiscalDocumentStatusValue.rejected,
        rejections: [extractFiscalRejection(body)],
        artifacts: [
          xmlArtifact(FiscalArtifactKindValue.requestXml, input.requestXml),
          xmlArtifact(FiscalArtifactKindValue.responseXml, body),
        ],
      };
    }

    if (looksAuthorized(body)) {
      const providerDocumentId = firstMatch(body, /<ChaveAcesso>([^<]+)<\/ChaveAcesso>/i);
      const protocol = firstMatch(body, /<Protocolo>([^<]+)<\/Protocolo>/i);
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

    return yield* Effect.fail(
      new NfseNacionalProviderError({
        code: NfseNacionalProviderErrorCodeValue.responseShapeError,
        retryable: false,
        reason:
          "Resposta da Sefin Nacional sem NFS-e autorizada nem mensagem de rejeição fiscal reconhecida.",
        operation: NfseNacionalOperationValue.responseParse,
        phase: NfseNacionalPhaseValue.responseBody,
      }),
    );
  });

const validateIssueInput = (
  input: IssueFiscalDocumentInput,
  config: NfseNacionalEnvironmentConfig,
): Effect.Effect<IssueFiscalDocumentInput, NfseNacionalProviderError> =>
  Schema.decodeUnknownEffect(issueFiscalDocumentInputSchema)(input).pipe(
    Effect.mapError(
      (error) =>
        new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.invalidInput,
          retryable: false,
          reason: "Entrada fiscal inválida para NFS-e Nacional.",
          operation: NfseNacionalOperationValue.schemaDecode,
          phase: NfseNacionalPhaseValue.issueInputDecode,
          schemaName: NfseNacionalSchemaNameValue.issueInput,
          ...schemaErrorMetadata(error),
        }),
    ),
    Effect.flatMap((decoded) => {
      if (decoded.documentKind !== FiscalDocumentKindValue.nfse) {
        return Effect.fail(
          new NfseNacionalProviderError({
            code: NfseNacionalProviderErrorCodeValue.invalidInput,
            retryable: false,
            reason: "NFS-e Nacional aceita apenas documentKind nfse.",
            operation: NfseNacionalOperationValue.schemaDecode,
            phase: NfseNacionalPhaseValue.issueInputValidation,
            schemaName: NfseNacionalSchemaNameValue.issueInput,
          }),
        );
      }

      if (decoded.environment !== config.environment) {
        return Effect.fail(
          new NfseNacionalProviderError({
            code: NfseNacionalProviderErrorCodeValue.invalidInput,
            retryable: false,
            reason:
              "Ambiente da entrada fiscal diverge do ambiente configurado no provider NFS-e Nacional.",
            operation: NfseNacionalOperationValue.schemaDecode,
            phase: NfseNacionalPhaseValue.issueInputValidation,
            schemaName: NfseNacionalSchemaNameValue.issueInput,
          }),
        );
      }

      return Effect.succeed(decoded);
    }),
  );

const validateDpsXml = (xml: string): Effect.Effect<string, NfseNacionalProviderError> => {
  const trimmed = xml.trim();
  return trimmed.length > 0 && trimmed.startsWith("<")
    ? Effect.succeed(trimmed)
    : Effect.fail(
        new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.dpsBuildError,
          retryable: false,
          reason: "buildDpsXml retornou DPS XML vazia ou inválida.",
          operation: NfseNacionalOperationValue.dpsBuild,
          phase: NfseNacionalPhaseValue.dpsXml,
        }),
      );
};

const nfsePostEndpoint = (config: NfseNacionalEnvironmentConfig): string =>
  `${config.endpoint}/nfse`;

export type NfseNacionalProviderDeps = {
  readonly manifest: FiscalProviderManifest;
  readonly config: NfseNacionalEnvironmentConfig;
  readonly buildDpsXml: NfseNacionalDpsXmlBuilder;
  readonly http: NfseNacionalHttpClient;
  readonly eventSink?: NfseNacionalEventSink | undefined;
  readonly correlationId?: string | undefined;
};

export type NfseNacionalProviderWithHttpServiceDeps = Omit<NfseNacionalProviderDeps, "http">;

export type NfseNacionalProvider = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, NfseNacionalProviderError>;
};

export type NfseNacionalProviderWithHttpService = {
  readonly manifest: FiscalProviderManifest;
  issue(
    input: IssueFiscalDocumentInput,
  ): Effect.Effect<IssueFiscalDocumentResponse, NfseNacionalProviderError, NfseNacionalHttpClient>;
};

export const createNfseNacionalProviderWithHttpService = (
  deps: NfseNacionalProviderWithHttpServiceDeps,
): NfseNacionalProviderWithHttpService => ({
  manifest: deps.manifest,
  issue: (input) =>
    Effect.flatMap(NfseNacionalHttpClientService, (http) =>
      createNfseNacionalProvider({ ...deps, http }).issue(input),
    ),
});

export const createNfseNacionalProvider = (
  deps: NfseNacionalProviderDeps,
): NfseNacionalProvider => {
  const { manifest, config, buildDpsXml, http, eventSink, correlationId } = deps;

  return {
    manifest,
    issue: (input): Effect.Effect<IssueFiscalDocumentResponse, NfseNacionalProviderError> =>
      Effect.gen(function* () {
        const decodedInput = yield* validateIssueInput(input, config);
        const documentRef = buildDocumentRef(decodedInput, manifest.id);

        yield* emit(
          eventSink,
          NfseNacionalEventNameValue.issueStarted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* emit(
          eventSink,
          NfseNacionalEventNameValue.dpsBuildStarted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        const requestXml = yield* buildDpsXml(decodedInput).pipe(
          Effect.flatMap(validateDpsXml),
          Effect.tapError(() =>
            emit(
              eventSink,
              NfseNacionalEventNameValue.dpsBuildFailed,
              decodedInput,
              manifest.id,
              correlationId,
            ),
          ),
        );
        yield* emit(
          eventSink,
          NfseNacionalEventNameValue.dpsBuildSucceeded,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* emit(
          eventSink,
          NfseNacionalEventNameValue.httpPostStarted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        const response = yield* http
          .postDpsXml({ endpoint: nfsePostEndpoint(config), dpsXml: requestXml })
          .pipe(
            Effect.tapError(() =>
              emit(
                eventSink,
                NfseNacionalEventNameValue.httpPostFailed,
                decodedInput,
                manifest.id,
                correlationId,
              ),
            ),
          );
        yield* emit(
          eventSink,
          NfseNacionalEventNameValue.httpPostSucceeded,
          decodedInput,
          manifest.id,
          correlationId,
        );

        const providerResponse = yield* parseIssueResponse({ requestXml, response });
        yield* emit(
          eventSink,
          providerResponse.status === FiscalDocumentStatusValue.rejected
            ? NfseNacionalEventNameValue.fiscalRejected
            : NfseNacionalEventNameValue.fiscalAuthorized,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* emit(
          eventSink,
          NfseNacionalEventNameValue.issueCompleted,
          decodedInput,
          manifest.id,
          correlationId,
        );
        yield* Effect.logInfo(NfseNacionalEventNameValue.issueCompleted, {
          provider_id: manifest.id,
          environment: decodedInput.environment,
          status: providerResponse.status,
        });

        return { documentRef, providerResponse };
      }).pipe(
        Effect.tapError((error) =>
          Effect.all([
            emit(
              eventSink,
              NfseNacionalEventNameValue.issueFailed,
              input,
              manifest.id,
              correlationId,
            ),
            Effect.logError(NfseNacionalEventNameValue.issueFailed, {
              provider_id: manifest.id,
              code: error.code,
              phase: error.phase ?? "unknown",
            }),
          ]),
        ),
        Effect.withSpan("nfse_nacional.issue", {
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

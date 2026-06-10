import type {
  FiscalDocumentRef,
  FiscalProvider,
  FiscalProviderError,
  FiscalProviderManifest,
  FiscalRejection,
  IssueFiscalDocumentInput,
  IssueFiscalDocumentResponse,
  ProviderResponse,
} from "@dfekit/fiscal";
import { encodeUtf8, getUtf8ByteLength, XML_MEDIA_TYPE } from "@dfekit/xml";
import { Result } from "better-result";
import { buildGerarNfseEnvelope, type GerarNfseSigner, SOAP_ACTION_GERAR_NFSE } from "./envelope";
import type { SaatriHttpClient } from "./http";
import { parseGerarNfseResponse } from "./parse";
import type {
  SaatriCredentials,
  SaatriEnvironmentConfig,
  SaatriEventName,
  SaatriEventSink,
} from "./config";
import { saatriErrorCatalog } from "./config";

export interface SaatriProviderDeps {
  readonly manifest: FiscalProviderManifest;
  readonly http: SaatriHttpClient;
  readonly config: SaatriEnvironmentConfig;
  readonly credentials: SaatriCredentials;
  readonly signer?: GerarNfseSigner;
  readonly eventSink?: SaatriEventSink;
}

const SAATRI_XML_SIZE_LIMIT_BYTES = 512 * 1024;

const emit = (
  eventSink: SaatriEventSink | undefined,
  name: SaatriEventName,
  input: IssueFiscalDocumentInput,
  providerId: string,
  config: SaatriEnvironmentConfig,
): void => {
  eventSink?.({
    name,
    providerId,
    documentKind: input.documentKind,
    environment: input.environment,
    cityCode: config.cityCode,
    series: input.series,
    number: input.number,
  });
};

const buildDocumentRef = (
  input: IssueFiscalDocumentInput,
  credentials: SaatriCredentials,
  providerId: string,
): FiscalDocumentRef => ({
  documentKind: "nfse",
  providerId,
  environment: input.environment,
  issuerTaxId: credentials.issuerCnpj,
  series: input.series,
  number: input.number,
});

const xmlArtifact = (xml: string) => ({
  kind: "request_xml" as const,
  mediaType: XML_MEDIA_TYPE,
  bytes: encodeUtf8(xml),
});

const validationRejectedResponse = (
  rejections: readonly FiscalRejection[],
  requestXml: string,
): ProviderResponse => ({
  status: "rejected",
  rejections,
  artifacts: [xmlArtifact(requestXml)],
});

const validateSaatriIssueInput = (input: IssueFiscalDocumentInput): readonly FiscalRejection[] => {
  const firstInvalidServiceList = input.services.find(
    (service) => service.serviceListCode.length > 8,
  );
  const firstMissingNbs = input.services.find(
    (service) => service.nbsCode === undefined || service.nbsCode.trim() === "",
  );
  const serviceListRejection: readonly FiscalRejection[] =
    firstInvalidServiceList === undefined
      ? []
      : [
          {
            code: "SAATRI_ITEM_LISTA_SERVICO_MAX_LENGTH",
            message: "ItemListaServico deve ter no máximo 8 caracteres para SAATRI/ABRASF 2.03.",
            correctionHint: "Informe um código de lista de serviço com até 8 caracteres.",
          },
        ];
  const nbsRejection: readonly FiscalRejection[] =
    firstMissingNbs === undefined
      ? []
      : [
          {
            code: "SAATRI_CODIGO_NBS_REQUIRED_2026",
            message: "CodigoNbs é obrigatório pela regra nacional compartilhada em 2026.",
            correctionHint: "Informe services[].nbsCode antes de emitir a NFS-e.",
          },
        ];
  return [...serviceListRejection, ...nbsRejection];
};

export const createSaatriProvider = (deps: SaatriProviderDeps): FiscalProvider => {
  const { manifest, http, config, credentials, signer, eventSink } = deps;

  return {
    manifest,
    issue: (
      input: IssueFiscalDocumentInput,
    ): Promise<Result<IssueFiscalDocumentResponse, FiscalProviderError>> =>
      Result.gen(async function* () {
        emit(eventSink, "saatri.issue.started", input, manifest.id, config);
        if (signer === undefined)
          emit(eventSink, "saatri.optional.signer.not_configured", input, manifest.id, config);

        emit(eventSink, "saatri.envelope.build.started", input, manifest.id, config);
        const envelope = yield* Result.await(
          buildGerarNfseEnvelope(
            input,
            credentials,
            config,
            signer !== undefined ? { signer } : {},
          ),
        );
        emit(eventSink, "saatri.envelope.build.succeeded", input, manifest.id, config);

        if (getUtf8ByteLength(envelope) > SAATRI_XML_SIZE_LIMIT_BYTES) {
          emit(eventSink, "saatri.envelope.build.failed", input, manifest.id, config);
          return yield* Result.err({
            code: saatriErrorCatalog.XML_SIZE_LIMIT_EXCEEDED.code,
            message: saatriErrorCatalog.XML_SIZE_LIMIT_EXCEEDED().message,
            retryable: false,
          });
        }

        const validationRejections = validateSaatriIssueInput(input);
        if (validationRejections.length > 0) {
          emit(eventSink, "saatri.fiscal.rejected", input, manifest.id, config);
          return Result.ok<IssueFiscalDocumentResponse>({
            documentRef: buildDocumentRef(input, credentials, manifest.id),
            providerResponse: validationRejectedResponse(validationRejections, envelope),
          });
        }

        emit(eventSink, "saatri.http.post.started", input, manifest.id, config);
        const responseXml = yield* Result.await(
          http.postSoap({
            endpoint: config.endpoint,
            soapAction: SOAP_ACTION_GERAR_NFSE,
            envelope,
          }),
        );
        emit(eventSink, "saatri.http.post.succeeded", input, manifest.id, config);

        emit(eventSink, "saatri.response.parse.started", input, manifest.id, config);
        const providerResponse = yield* parseGerarNfseResponse({
          requestXml: envelope,
          responseXml,
        });
        emit(eventSink, "saatri.response.parse.succeeded", input, manifest.id, config);
        emit(
          eventSink,
          providerResponse.status === "rejected"
            ? "saatri.fiscal.rejected"
            : providerResponse.status === "authorized"
              ? "saatri.fiscal.authorized"
              : "saatri.artifact.created",
          input,
          manifest.id,
          config,
        );

        return Result.ok<IssueFiscalDocumentResponse>({
          documentRef: buildDocumentRef(input, credentials, manifest.id),
          providerResponse,
        });
      }),
  };
};

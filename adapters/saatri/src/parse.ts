import { FiscalArtifactKindValue, FiscalDocumentStatusValue } from "@dfe-kit/fiscal";
import type { FiscalArtifact, FiscalRejection, ProviderResponse } from "@dfe-kit/fiscal";
import { encodeUtf8, getUtf8ByteLength, XML_MEDIA_TYPE } from "@dfe-kit/xml";
import { safeCauseMetadata, schemaErrorMetadata } from "@dfe-kit/fiscal/effect-error-metadata";
import { Effect, Metric, Schema } from "effect";
import { XMLParser } from "fast-xml-parser";
import {
  generateNfseOutputDocumentSchema,
  generateNfseSoapDocumentSchema,
  type GenerateNfseResponse,
  SaatriOperationValue,
  SaatriPhaseValue,
  type SaatriPhase,
  SaatriProviderError,
  SaatriProviderErrorCodeValue,
  SaatriSchemaNameValue,
} from "./config";
import {
  SaatriAttributeNameValue,
  SaatriSpanNameValue,
  saatriParseErrorTotal,
  saatriXmlBytes,
} from "./observability";

const xmlArtifact = (kind: FiscalArtifact["kind"], xml: string): FiscalArtifact => ({
  kind,
  mediaType: XML_MEDIA_TYPE,
  bytes: encodeUtf8(xml),
});

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: true,
  removeNSPrefix: true,
});

const decodeSoapDocument = Schema.decodeUnknownEffect(generateNfseSoapDocumentSchema);
const decodeOutputDocument = Schema.decodeUnknownEffect(generateNfseOutputDocumentSchema);

const SAATRI_PENDING_NATIONAL_SHARE_PATTERNS = [
  /\bdps\b/i,
  /compartilh|consulta posterior|ambiente nacional/i,
];

const isPendingNationalShareMessage = (message: string): boolean =>
  SAATRI_PENDING_NATIONAL_SHARE_PATTERNS.every((pattern) => pattern.test(message));

const parseXml = (xml: string, phase: SaatriPhase): Effect.Effect<unknown, SaatriProviderError> =>
  Effect.try({
    try: () => parser.parse(xml),
    catch: (cause) =>
      new SaatriProviderError({
        code: SaatriProviderErrorCodeValue.parseError,
        retryable: false,
        reason: "Falha ao interpretar XML de resposta SAATRI.",
        operation: SaatriOperationValue.xmlParse,
        phase,
        ...safeCauseMetadata(cause),
      }),
  }).pipe(
    Effect.tap(() => Metric.update(saatriXmlBytes, getUtf8ByteLength(xml))),
    Effect.tapError((error) =>
      Metric.update(
        Metric.withAttributes(saatriParseErrorTotal, {
          code: error.code,
          phase: error.phase ?? "unknown",
        }),
        1,
      ),
    ),
    Effect.withSpan(SaatriSpanNameValue.xmlParse, {
      attributes: {
        [SaatriAttributeNameValue.phase]: phase,
        [SaatriAttributeNameValue.xmlBytes]: getUtf8ByteLength(xml),
      },
    }),
  );

const extractOutputXml = (soapResponseXml: string): Effect.Effect<string, SaatriProviderError> =>
  parseXml(soapResponseXml, SaatriPhaseValue.responseParse).pipe(
    Effect.flatMap((parsedXml) =>
      decodeSoapDocument(parsedXml).pipe(
        Effect.mapError(
          (error) =>
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.responseShapeError,
              retryable: false,
              reason: "Resposta SAATRI não contém o formato SOAP esperado.",
              operation: SaatriOperationValue.schemaDecode,
              phase: SaatriPhaseValue.soapOutputExtract,
              schemaName: SaatriSchemaNameValue.generateNfseSoapDocument,
              ...schemaErrorMetadata(error),
            }),
        ),
      ),
    ),
    Effect.map((parsedSoap) => parsedSoap.Envelope.Body.GerarNfseResponse.outputXML),
  );

const decodeGenerateNfseOutput = (
  outputXml: string,
): Effect.Effect<GenerateNfseResponse, SaatriProviderError> =>
  parseXml(outputXml, SaatriPhaseValue.nfseOutputDecode).pipe(
    Effect.flatMap((parsedXml) =>
      decodeOutputDocument(parsedXml).pipe(
        Effect.mapError(
          (error) =>
            new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.parseError,
              reason: "XML de saída SAATRI não contém um retorno ABRASF GerarNfse válido.",
              retryable: false,
              operation: SaatriOperationValue.schemaDecode,
              phase: SaatriPhaseValue.nfseOutputDecode,
              schemaName: SaatriSchemaNameValue.generateNfseOutputDocument,
              ...schemaErrorMetadata(error),
            }),
        ),
      ),
    ),
    Effect.map((parsedOutput) =>
      "GerarNfseResposta" in parsedOutput ? parsedOutput.GerarNfseResposta : parsedOutput,
    ),
  );

export const parseGerarNfseResponse = (args: {
  readonly requestXml: string;
  readonly responseXml: string;
}): Effect.Effect<ProviderResponse, SaatriProviderError> =>
  Effect.gen(function* () {
    const outputXml = yield* extractOutputXml(args.responseXml);
    const parsedResponse = yield* decodeGenerateNfseOutput(outputXml);

    const artifacts: readonly FiscalArtifact[] = [
      xmlArtifact(FiscalArtifactKindValue.requestXml, args.requestXml),
      xmlArtifact(FiscalArtifactKindValue.responseXml, args.responseXml),
    ];
    if ("ListaMensagemRetorno" in parsedResponse) {
      const messages = parsedResponse.ListaMensagemRetorno.MensagemRetorno;
      const hasPendingNationalShareMessage = messages.some((message) =>
        isPendingNationalShareMessage(message.Mensagem),
      );
      if (hasPendingNationalShareMessage) {
        return {
          status: FiscalDocumentStatusValue.acceptedPendingAuthorization,
          rejections: [],
          artifacts,
        };
      }

      const rejections: readonly FiscalRejection[] = messages.map((message) => ({
        code: message.Codigo,
        message: message.Mensagem,
        ...(message.Correcao !== undefined ? { correctionHint: message.Correcao } : {}),
      }));
      return {
        status: FiscalDocumentStatusValue.rejected,
        rejections,
        artifacts,
      };
    }

    const infNfse = parsedResponse.ListaNfse.CompNfse.Nfse.InfNfse;
    return {
      status: FiscalDocumentStatusValue.authorized,
      providerDocumentId: infNfse.Numero,
      protocol: infNfse.CodigoVerificacao,
      rejections: [],
      artifacts: [...artifacts, xmlArtifact(FiscalArtifactKindValue.authorizedXml, outputXml)],
    };
  });

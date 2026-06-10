import type {
  FiscalArtifact,
  FiscalProviderError,
  FiscalRejection,
  ProviderResponse,
} from "@dfe-kit/fiscal";
import { encodeUtf8, XML_MEDIA_TYPE } from "@dfe-kit/xml";
import { panic, Result } from "better-result";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import {
  generateNfseErrorResponseSchema,
  generateNfseOutputDocumentSchema,
  generateNfseSoapDocumentSchema,
  generateNfseSuccessResponseSchema,
  type GenerateNfseResponse,
  saatriErrorCatalog,
} from "./config";

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

const parseFailure = (reason: string): FiscalProviderError => ({
  code: saatriErrorCatalog.PARSE_ERROR.code,
  message: saatriErrorCatalog.PARSE_ERROR({ reason }).message,
  retryable: false,
});

const responseShapeFailure = (): FiscalProviderError => ({
  code: saatriErrorCatalog.RESPONSE_SHAPE_ERROR.code,
  message: saatriErrorCatalog.RESPONSE_SHAPE_ERROR().message,
  retryable: false,
});

const extractOutputXml = (soapResponseXml: string): Result<string, FiscalProviderError> => {
  const parsedSoap = generateNfseSoapDocumentSchema.safeParse(parser.parse(soapResponseXml));
  if (!parsedSoap.success) return Result.err(responseShapeFailure());
  return Result.ok(parsedSoap.data.Envelope.Body.GerarNfseResponse.outputXML);
};

const decodeGenerateNfseOutput = (
  outputXml: string,
): Result<GenerateNfseResponse, FiscalProviderError> => {
  const parsedOutput = generateNfseOutputDocumentSchema.safeParse(parser.parse(outputXml));
  if (!parsedOutput.success) return Result.err(parseFailure(z.prettifyError(parsedOutput.error)));

  if ("GerarNfseResposta" in parsedOutput.data) {
    return Result.ok(parsedOutput.data.GerarNfseResposta);
  }

  return Result.ok(parsedOutput.data);
};

const mapResponse = (
  parsedResponse: GenerateNfseResponse,
  requestXml: string,
  responseXml: string,
  outputXml: string,
): Result<ProviderResponse, FiscalProviderError> => {
  const artifacts: readonly FiscalArtifact[] = [
    xmlArtifact("request_xml", requestXml),
    xmlArtifact("response_xml", responseXml),
  ];
  const authorizedArtifacts: readonly FiscalArtifact[] = [
    ...artifacts,
    xmlArtifact("authorized_xml", outputXml),
  ];

  const errorResponse = generateNfseErrorResponseSchema.safeParse(parsedResponse);
  if (errorResponse.success) {
    const messages = errorResponse.data.ListaMensagemRetorno.MensagemRetorno;
    const hasPendingNationalShareMessage = messages.some(
      (message) =>
        /\bdps\b/i.test(message.Mensagem) &&
        /compartilh|consulta posterior|ambiente nacional/i.test(message.Mensagem),
    );
    if (hasPendingNationalShareMessage) {
      return Result.ok({
        status: "accepted_pending_authorization",
        rejections: [],
        artifacts,
      } satisfies ProviderResponse);
    }

    const rejections: readonly FiscalRejection[] = messages.map((message) => ({
      code: message.Codigo,
      message: message.Mensagem,
      ...(message.Correcao !== undefined ? { correctionHint: message.Correcao } : {}),
    }));
    return Result.ok({
      status: "rejected",
      rejections,
      artifacts,
    } satisfies ProviderResponse);
  }

  const successResponse = generateNfseSuccessResponseSchema.safeParse(parsedResponse);
  if (!successResponse.success) panic("generateNfseResponseSchema returned an impossible shape.");

  const infNfse = successResponse.data.ListaNfse.CompNfse.Nfse.InfNfse;
  return Result.ok({
    status: "authorized",
    providerDocumentId: infNfse.Numero,
    protocol: infNfse.CodigoVerificacao,
    rejections: [],
    artifacts: authorizedArtifacts,
  } satisfies ProviderResponse);
};

export const parseGerarNfseResponse = (args: {
  readonly requestXml: string;
  readonly responseXml: string;
}): Result<ProviderResponse, FiscalProviderError> =>
  extractOutputXml(args.responseXml).andThen((outputXml) =>
    decodeGenerateNfseOutput(outputXml).andThen((parsedResponse) =>
      mapResponse(parsedResponse, args.requestXml, args.responseXml, outputXml),
    ),
  );

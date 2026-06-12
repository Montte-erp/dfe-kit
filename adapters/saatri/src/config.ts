import type {
  FiscalProviderCapability,
  FiscalProviderCapabilityMetadata,
  FiscalProviderError,
  FiscalRejection,
} from "@dfe-kit/fiscal";
import {
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
  fiscalDocumentKindSchema,
  fiscalEnvironmentSchema,
  fiscalProviderCapabilityMetadataSchema,
} from "@dfe-kit/fiscal/schemas";
import { Schema, type Effect, type Redacted, type SchemaIssue } from "effect";

const nonEmptyString: Schema.Decoder<string> = Schema.NonEmptyString;
const redactedNonEmptyString: Schema.Decoder<Redacted.Redacted<string>> = Schema.RedactedFromValue(
  nonEmptyString,
  {
    label: "saatri-secret",
    disallowEncode: true,
  },
);
const urlString: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^https?:\/\/.+/));
const saatriEndpointUrl: Schema.Decoder<string> = urlString.check(
  Schema.makeFilter((value) => value.includes("saatri"), {
    expected: "SAATRI endpoint URL containing 'saatri'",
  }),
);
const cnpjDigits: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^\d{14}$/));
const cityCode: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^\d{7}$/));

const documentKindSchema = fiscalDocumentKindSchema;

export type SaatriProviderErrorCode =
  | "saatri.CONFIG_ERROR"
  | "saatri.INVALID_INPUT"
  | "saatri.NETWORK_ERROR"
  | "saatri.RESPONSE_READ_ERROR"
  | "saatri.HTTP_STATUS_ERROR"
  | "saatri.PARSE_ERROR"
  | "saatri.RESPONSE_SHAPE_ERROR"
  | "saatri.XML_SIZE_LIMIT_EXCEEDED"
  | "saatri.SIGN_ERROR";
const SaatriProviderErrorCodeSchema: Schema.Decoder<SaatriProviderErrorCode> = Schema.Literals([
  "saatri.CONFIG_ERROR",
  "saatri.INVALID_INPUT",
  "saatri.NETWORK_ERROR",
  "saatri.RESPONSE_READ_ERROR",
  "saatri.HTTP_STATUS_ERROR",
  "saatri.PARSE_ERROR",
  "saatri.RESPONSE_SHAPE_ERROR",
  "saatri.XML_SIZE_LIMIT_EXCEEDED",
  "saatri.SIGN_ERROR",
]);
export const SaatriProviderErrorCodeValue = {
  configError: "saatri.CONFIG_ERROR",
  invalidInput: "saatri.INVALID_INPUT",
  networkError: "saatri.NETWORK_ERROR",
  responseReadError: "saatri.RESPONSE_READ_ERROR",
  httpStatusError: "saatri.HTTP_STATUS_ERROR",
  parseError: "saatri.PARSE_ERROR",
  responseShapeError: "saatri.RESPONSE_SHAPE_ERROR",
  xmlSizeLimitExceeded: "saatri.XML_SIZE_LIMIT_EXCEEDED",
  signError: "saatri.SIGN_ERROR",
} satisfies Record<string, SaatriProviderErrorCode>;

export type SaatriOperation = "http.post" | "http.response.text" | "xml.parse" | "schema.decode";
const SaatriOperationSchema: Schema.Decoder<SaatriOperation> = Schema.Literals([
  "http.post",
  "http.response.text",
  "xml.parse",
  "schema.decode",
]);
export const SaatriOperationValue = {
  httpPost: "http.post",
  httpResponseText: "http.response.text",
  xmlParse: "xml.parse",
  schemaDecode: "schema.decode",
} satisfies Record<string, SaatriOperation>;

export type SaatriPhase =
  | "http.status"
  | "http.transport"
  | "http.timeout"
  | "http.response.body"
  | "response.parse"
  | "soap.output.extract"
  | "nfse.output.decode"
  | "package.config.decode"
  | "credentials.decode"
  | "provider.options.decode"
  | "environment.config.decode";
const SaatriPhaseSchema: Schema.Decoder<SaatriPhase> = Schema.Literals([
  "http.status",
  "http.transport",
  "http.timeout",
  "http.response.body",
  "response.parse",
  "soap.output.extract",
  "nfse.output.decode",
  "package.config.decode",
  "credentials.decode",
  "provider.options.decode",
  "environment.config.decode",
]);
export const SaatriPhaseValue = {
  httpStatus: "http.status",
  httpTransport: "http.transport",
  httpTimeout: "http.timeout",
  httpResponseBody: "http.response.body",
  responseParse: "response.parse",
  soapOutputExtract: "soap.output.extract",
  nfseOutputDecode: "nfse.output.decode",
  packageConfigDecode: "package.config.decode",
  credentialsDecode: "credentials.decode",
  providerOptionsDecode: "provider.options.decode",
  environmentConfigDecode: "environment.config.decode",
} satisfies Record<string, SaatriPhase>;

export type SaatriSchemaName =
  | "SaatriProviderPackageConfig"
  | "SaatriCredentials"
  | "CreateSaatriPackageProviderOptions"
  | "SaatriEnvironmentConfig"
  | "GenerateNfseSoapDocument"
  | "GenerateNfseOutputDocument";
const SaatriSchemaNameSchema: Schema.Decoder<SaatriSchemaName> = Schema.Literals([
  "SaatriProviderPackageConfig",
  "SaatriCredentials",
  "CreateSaatriPackageProviderOptions",
  "SaatriEnvironmentConfig",
  "GenerateNfseSoapDocument",
  "GenerateNfseOutputDocument",
]);
export const SaatriSchemaNameValue = {
  providerPackageConfig: "SaatriProviderPackageConfig",
  credentials: "SaatriCredentials",
  packageProviderOptions: "CreateSaatriPackageProviderOptions",
  environmentConfig: "SaatriEnvironmentConfig",
  generateNfseSoapDocument: "GenerateNfseSoapDocument",
  generateNfseOutputDocument: "GenerateNfseOutputDocument",
} satisfies Record<string, SaatriSchemaName>;

export type SaatriUpstreamTag =
  | "StatusCodeError"
  | "HttpClientError"
  | "TimeoutError"
  | "ResponseBodyError";
const SaatriUpstreamTagSchema: Schema.Decoder<SaatriUpstreamTag> = Schema.Literals([
  "StatusCodeError",
  "HttpClientError",
  "TimeoutError",
  "ResponseBodyError",
]);
export const saatriUpstreamTagSchema: Schema.Decoder<SaatriUpstreamTag> = SaatriUpstreamTagSchema;
export const SaatriUpstreamTagValue = {
  statusCodeError: "StatusCodeError",
  httpClientError: "HttpClientError",
  timeoutError: "TimeoutError",
  responseBodyError: "ResponseBodyError",
} satisfies Record<string, SaatriUpstreamTag>;

type SaatriProviderErrorFields = {
  readonly _tag: "SaatriProviderError";
  readonly code: SaatriProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number | undefined;
  readonly reason?: string | undefined;
  readonly operation?: string | undefined;
  readonly phase?: string | undefined;
  readonly schemaName?: string | undefined;
  readonly issuePath?: string | undefined;
  readonly issueMessage?: string | undefined;
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

type SaatriProviderErrorInput = {
  readonly code: SaatriProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number | undefined;
  readonly reason?: string | undefined;
  readonly operation?: string | undefined;
  readonly phase?: string | undefined;
  readonly schemaName?: string | undefined;
  readonly issuePath?: string | undefined;
  readonly issueMessage?: string | undefined;
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

type SaatriProviderErrorConstructor = new (
  input: SaatriProviderErrorInput,
) => SaatriProviderErrorFields;

const SaatriProviderErrorBase: SaatriProviderErrorConstructor =
  Schema.TaggedErrorClass<SaatriProviderErrorFields>()("SaatriProviderError", {
    code: SaatriProviderErrorCodeSchema,
    retryable: Schema.Boolean,
    status: Schema.optional(Schema.Number),
    reason: Schema.optional(Schema.String),
    operation: Schema.optional(SaatriOperationSchema),
    phase: Schema.optional(SaatriPhaseSchema),
    schemaName: Schema.optional(SaatriSchemaNameSchema),
    issuePath: Schema.optional(Schema.String),
    issueMessage: Schema.optional(Schema.String),
    upstreamTag: Schema.optional(Schema.String),
    upstreamCode: Schema.optional(Schema.String),
  });

export class SaatriProviderError extends SaatriProviderErrorBase implements FiscalProviderError {
  get message(): string {
    switch (this.code) {
      case "saatri.NETWORK_ERROR":
        return "Falha de rede ao comunicar com o servidor SAATRI.";
      case "saatri.RESPONSE_READ_ERROR":
        return "Não foi possível ler o corpo da resposta SAATRI.";
      case "saatri.HTTP_STATUS_ERROR":
        return `Servidor SAATRI respondeu com status HTTP ${this.status}.`;
      case "saatri.PARSE_ERROR":
        return this.reason ?? "Falha ao interpretar XML de resposta SAATRI.";
      case "saatri.RESPONSE_SHAPE_ERROR":
        return "Resposta da SAATRI sem <outputXML> de GerarNfseResponse. O servidor pode ter retornado um SOAP Fault ou erro de autenticação.";
      case "saatri.XML_SIZE_LIMIT_EXCEEDED":
        return "XML SAATRI excede o limite de 512 KB informado pelo provedor.";
      case "saatri.SIGN_ERROR":
        return this.reason ?? "Falha ao assinar o XML fiscal.";
      case "saatri.CONFIG_ERROR":
        return this.reason ?? "Configuração SAATRI inválida.";
      case "saatri.INVALID_INPUT":
        return this.reason ?? "Entrada fiscal inválida para emissão SAATRI.";
    }
  }
}

type SafeCauseMetadata = {
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

const firstStringField = (input: unknown, field: string): string | undefined => {
  if (typeof input !== "object" || input === null) {
    return undefined;
  }
  const entry = Object.entries(input).find(([key]) => key === field);
  const value = entry?.[1];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export const safeCauseMetadata = (cause: unknown): SafeCauseMetadata => ({
  upstreamTag: firstStringField(cause, "_tag") ?? firstStringField(cause, "name"),
  upstreamCode: firstStringField(cause, "code"),
});

type SchemaIssueMetadata = {
  readonly issuePath?: string | undefined;
  readonly issueMessage: string;
  readonly upstreamTag: string;
};

const formatIssuePath = (path: ReadonlyArray<PropertyKey>): string | undefined =>
  path.length === 0 ? undefined : path.map((segment) => String(segment)).join(".");

const schemaIssueLeafMetadata = (
  issue: SchemaIssue.Issue,
  path: ReadonlyArray<PropertyKey> = [],
): SchemaIssueMetadata => {
  switch (issue._tag) {
    case "Pointer":
      return schemaIssueLeafMetadata(issue.issue, [...path, ...issue.path]);
    case "Composite":
      return schemaIssueLeafMetadata(issue.issues[0], path);
    case "Encoding":
      return schemaIssueLeafMetadata(issue.issue, path);
    case "Filter":
      return schemaIssueLeafMetadata(issue.issue, path);
    case "AnyOf":
      return issue.issues[0] === undefined
        ? {
            issuePath: formatIssuePath(path),
            issueMessage: "Nenhum membro da união aceitou o valor.",
            upstreamTag: issue._tag,
          }
        : schemaIssueLeafMetadata(issue.issues[0], path);
    case "InvalidType":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Tipo inválido para o schema.",
        upstreamTag: issue._tag,
      };
    case "InvalidValue":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Valor inválido para o schema.",
        upstreamTag: issue._tag,
      };
    case "MissingKey":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Chave obrigatória ausente no schema.",
        upstreamTag: issue._tag,
      };
    case "UnexpectedKey":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Chave inesperada no schema.",
        upstreamTag: issue._tag,
      };
    case "Forbidden":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Operação proibida durante decode de schema.",
        upstreamTag: issue._tag,
      };
    case "OneOf":
      return {
        issuePath: formatIssuePath(path),
        issueMessage: "Mais de um membro da união aceitou o valor.",
        upstreamTag: issue._tag,
      };
  }
};

export const schemaErrorMetadata = (error: Schema.SchemaError): SchemaIssueMetadata =>
  schemaIssueLeafMetadata(error.issue);

export type GerarNfseSigner = (xmlToSign: string) => Effect.Effect<string, SaatriProviderError>;

export type SaatriCredentials = {
  readonly username: string;
  readonly password: Redacted.Redacted<string>;
  readonly issuerCnpj: string;
  readonly municipalRegistration: string;
};
const SaatriCredentialsSchema: Schema.Decoder<SaatriCredentials> = Schema.Struct({
  username: nonEmptyString,
  password: redactedNonEmptyString,
  issuerCnpj: cnpjDigits,
  municipalRegistration: nonEmptyString,
});
export const saatriCredentialsSchema: Schema.Decoder<SaatriCredentials> = SaatriCredentialsSchema;

export type SaatriEnvironmentConfig = {
  readonly environment: "homologation" | "production";
  readonly endpoint: string;
  readonly cityCode: string;
};
const SaatriEnvironmentConfigSchema: Schema.Decoder<SaatriEnvironmentConfig> = Schema.Struct({
  environment: fiscalEnvironmentSchema,
  endpoint: saatriEndpointUrl,
  cityCode,
});
export const saatriEnvironmentConfigSchema: Schema.Decoder<SaatriEnvironmentConfig> =
  SaatriEnvironmentConfigSchema;

export type CreateSaatriProviderOptionsInput = {
  readonly environment: "homologation" | "production";
  readonly timeoutMs?: number | undefined;
  readonly maxRetries?: number | undefined;
  readonly retryBaseMillis?: number | undefined;
  readonly retryableStatus?: readonly number[] | undefined;
  readonly signer?: unknown;
  readonly eventSink?: unknown;
  readonly correlationId?: string | undefined;
};
const CreateSaatriProviderOptionsSchema: Schema.Decoder<CreateSaatriProviderOptionsInput> =
  Schema.Struct({
    environment: fiscalEnvironmentSchema,
    timeoutMs: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    maxRetries: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(-1))),
    retryBaseMillis: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    retryableStatus: Schema.optional(
      Schema.Array(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    ),
    signer: Schema.optional(Schema.Unknown),
    eventSink: Schema.optional(Schema.Unknown),
    correlationId: Schema.optional(Schema.String),
  });
export const createSaatriProviderOptionsSchema: Schema.Decoder<CreateSaatriProviderOptionsInput> =
  CreateSaatriProviderOptionsSchema;

const CreateSaatriPackageProviderOptionsSchema: Schema.Decoder<CreateSaatriProviderOptionsInput> =
  CreateSaatriProviderOptionsSchema;
export type CreateSaatriPackageProviderOptions = CreateSaatriProviderOptionsInput & {
  readonly signer?: GerarNfseSigner | undefined;
  readonly eventSink?: SaatriEventSink | undefined;
  readonly correlationId?: string | undefined;
};
export const createSaatriPackageProviderOptionsSchema: Schema.Decoder<CreateSaatriProviderOptionsInput> =
  CreateSaatriPackageProviderOptionsSchema;

export type SaatriProviderPackageConfig = {
  readonly providerId: string;
  readonly providerName: string;
  readonly cityCode: string;
  readonly endpoints: Readonly<Record<"homologation" | "production", string>>;
  readonly extraCapabilityMetadata?: readonly FiscalProviderCapabilityMetadata[] | undefined;
};
const SaatriProviderPackageConfigSchema: Schema.Decoder<SaatriProviderPackageConfig> =
  Schema.Struct({
    providerId: nonEmptyString,
    providerName: nonEmptyString,
    cityCode,
    endpoints: Schema.Record(Schema.Literals(["homologation", "production"]), saatriEndpointUrl),
    extraCapabilityMetadata: Schema.optional(Schema.Array(fiscalProviderCapabilityMetadataSchema)),
  });
export const saatriProviderPackageConfigSchema: Schema.Decoder<SaatriProviderPackageConfig> =
  SaatriProviderPackageConfigSchema;

export type SaatriIssueRuntimeConfigInput = {
  readonly credentials: SaatriCredentials;
  readonly config: SaatriEnvironmentConfig;
};
const SaatriIssueRuntimeConfigInputSchema: Schema.Decoder<SaatriIssueRuntimeConfigInput> =
  Schema.Struct({
    credentials: saatriCredentialsSchema,
    config: saatriEnvironmentConfigSchema,
  });
export const saatriIssueRuntimeConfigSchema: Schema.Decoder<SaatriIssueRuntimeConfigInput> =
  SaatriIssueRuntimeConfigInputSchema;

export const SAATRI_CABECALHO_VERSION = "2.01";
export const SAATRI_ABRASF_VERSION = "2.03";

export type SaatriSoapHeader = {
  readonly cabecalhoVersion: typeof SAATRI_CABECALHO_VERSION;
  readonly dataVersion: typeof SAATRI_ABRASF_VERSION;
  readonly usernameToken: {
    readonly username: string;
    readonly password: Redacted.Redacted<string>;
  };
};
const SaatriSoapHeaderSchema: Schema.Decoder<SaatriSoapHeader> = Schema.Struct({
  cabecalhoVersion: Schema.Literal(SAATRI_CABECALHO_VERSION),
  dataVersion: Schema.Literal(SAATRI_ABRASF_VERSION),
  usernameToken: Schema.Struct({
    username: nonEmptyString,
    password: redactedNonEmptyString,
  }),
});
export const saatriSoapHeaderSchema: Schema.Decoder<SaatriSoapHeader> = SaatriSoapHeaderSchema;

export type ReturnMessage = {
  readonly Codigo: string;
  readonly Mensagem: string;
  readonly Correcao?: string | undefined;
};
const ReturnMessageSchema: Schema.Decoder<ReturnMessage> = Schema.Struct({
  Codigo: Schema.String,
  Mensagem: Schema.String,
  Correcao: Schema.optional(Schema.String),
});
export const returnMessageSchema: Schema.Decoder<ReturnMessage> = ReturnMessageSchema;

export type GenerateNfseSuccessResponse = {
  readonly ListaNfse: {
    readonly CompNfse: {
      readonly Nfse: {
        readonly InfNfse: {
          readonly Numero: string;
          readonly CodigoVerificacao: string;
          readonly DataEmissao?: string | undefined;
        };
      };
    };
  };
};
const GenerateNfseSuccessResponseSchema: Schema.Decoder<GenerateNfseSuccessResponse> =
  Schema.Struct({
    ListaNfse: Schema.Struct({
      CompNfse: Schema.Struct({
        Nfse: Schema.Struct({
          InfNfse: Schema.Struct({
            Numero: Schema.String,
            CodigoVerificacao: Schema.String,
            DataEmissao: Schema.optional(Schema.String),
          }),
        }),
      }),
    }),
  });
export const generateNfseSuccessResponseSchema: Schema.Decoder<GenerateNfseSuccessResponse> =
  GenerateNfseSuccessResponseSchema;

export type GenerateNfseErrorResponse = {
  readonly ListaMensagemRetorno: {
    readonly MensagemRetorno: readonly ReturnMessage[];
  };
};
const GenerateNfseErrorResponseSchema: Schema.Decoder<GenerateNfseErrorResponse> = Schema.Struct({
  ListaMensagemRetorno: Schema.Struct({
    MensagemRetorno: Schema.ArrayEnsure(returnMessageSchema),
  }),
});
export const generateNfseErrorResponseSchema: Schema.Decoder<GenerateNfseErrorResponse> =
  GenerateNfseErrorResponseSchema;

export type GenerateNfseResponse = GenerateNfseSuccessResponse | GenerateNfseErrorResponse;
const GenerateNfseResponseSchema: Schema.Decoder<GenerateNfseResponse> = Schema.Union([
  generateNfseSuccessResponseSchema,
  generateNfseErrorResponseSchema,
]);
export const generateNfseResponseSchema: Schema.Decoder<GenerateNfseResponse> =
  GenerateNfseResponseSchema;

export type GenerateNfseSoapDocument = {
  readonly Envelope: {
    readonly Body: {
      readonly GerarNfseResponse: {
        readonly outputXML: string;
      };
    };
  };
};
const GenerateNfseSoapDocumentSchema: Schema.Decoder<GenerateNfseSoapDocument> = Schema.Struct({
  Envelope: Schema.Struct({
    Body: Schema.Struct({
      GerarNfseResponse: Schema.Struct({
        outputXML: nonEmptyString,
      }),
    }),
  }),
});
export const generateNfseSoapDocumentSchema: Schema.Decoder<GenerateNfseSoapDocument> =
  GenerateNfseSoapDocumentSchema;

export type GenerateNfseOutputDocument =
  | { readonly GerarNfseResposta: GenerateNfseResponse }
  | GenerateNfseResponse;
const GenerateNfseOutputDocumentSchema: Schema.Decoder<GenerateNfseOutputDocument> = Schema.Union([
  Schema.Struct({ GerarNfseResposta: generateNfseResponseSchema }),
  generateNfseResponseSchema,
]);
export const generateNfseOutputDocumentSchema: Schema.Decoder<GenerateNfseOutputDocument> =
  GenerateNfseOutputDocumentSchema;

export type SaatriEventName =
  | "saatri.issue.started"
  | "saatri.issue.completed"
  | "saatri.issue.failed"
  | "saatri.envelope.build.started"
  | "saatri.envelope.build.succeeded"
  | "saatri.envelope.build.failed"
  | "saatri.sign.started"
  | "saatri.sign.succeeded"
  | "saatri.sign.failed"
  | "saatri.http.post.started"
  | "saatri.http.post.succeeded"
  | "saatri.http.post.failed"
  | "saatri.response.parse.started"
  | "saatri.response.parse.succeeded"
  | "saatri.response.parse.failed"
  | "saatri.fiscal.authorized"
  | "saatri.fiscal.rejected"
  | "saatri.fiscal.accepted_pending_authorization"
  | "saatri.artifact.created"
  | "saatri.optional.signer.not_configured";
const SaatriEventNameSchema: Schema.Decoder<SaatriEventName> = Schema.Literals([
  "saatri.issue.started",
  "saatri.issue.completed",
  "saatri.issue.failed",
  "saatri.envelope.build.started",
  "saatri.envelope.build.succeeded",
  "saatri.envelope.build.failed",
  "saatri.sign.started",
  "saatri.sign.succeeded",
  "saatri.sign.failed",
  "saatri.http.post.started",
  "saatri.http.post.succeeded",
  "saatri.http.post.failed",
  "saatri.response.parse.started",
  "saatri.response.parse.succeeded",
  "saatri.response.parse.failed",
  "saatri.fiscal.authorized",
  "saatri.fiscal.rejected",
  "saatri.fiscal.accepted_pending_authorization",
  "saatri.artifact.created",
  "saatri.optional.signer.not_configured",
]);
export const saatriEventNameSchema: Schema.Decoder<SaatriEventName> = SaatriEventNameSchema;
export const SaatriEventNameValue = {
  issueStarted: "saatri.issue.started",
  issueCompleted: "saatri.issue.completed",
  issueFailed: "saatri.issue.failed",
  envelopeBuildStarted: "saatri.envelope.build.started",
  envelopeBuildSucceeded: "saatri.envelope.build.succeeded",
  envelopeBuildFailed: "saatri.envelope.build.failed",
  signStarted: "saatri.sign.started",
  signSucceeded: "saatri.sign.succeeded",
  signFailed: "saatri.sign.failed",
  httpPostStarted: "saatri.http.post.started",
  httpPostSucceeded: "saatri.http.post.succeeded",
  httpPostFailed: "saatri.http.post.failed",
  responseParseStarted: "saatri.response.parse.started",
  responseParseSucceeded: "saatri.response.parse.succeeded",
  responseParseFailed: "saatri.response.parse.failed",
  fiscalAuthorized: "saatri.fiscal.authorized",
  fiscalRejected: "saatri.fiscal.rejected",
  fiscalAcceptedPendingAuthorization: "saatri.fiscal.accepted_pending_authorization",
  artifactCreated: "saatri.artifact.created",
  optionalSignerNotConfigured: "saatri.optional.signer.not_configured",
} satisfies Record<string, SaatriEventName>;
export type SaatriEvent = {
  readonly name: SaatriEventName;
  readonly providerId: string;
  readonly documentKind: "nfe" | "nfce" | "nfse";
  readonly environment: "homologation" | "production";
  readonly cityCode: string;
  readonly series: string;
  readonly number: string;
  readonly correlationId?: string | undefined;
};
const SaatriEventSchema: Schema.Decoder<SaatriEvent> = Schema.Struct({
  name: SaatriEventNameSchema,
  providerId: Schema.String,
  documentKind: documentKindSchema,
  environment: fiscalEnvironmentSchema,
  cityCode: Schema.String,
  series: Schema.String,
  number: Schema.String,
  correlationId: Schema.optional(Schema.String),
});
export const saatriEventSchema: Schema.Decoder<SaatriEvent> = SaatriEventSchema;
export type SaatriEventSink = (event: SaatriEvent) => Effect.Effect<void, never>;

export const SaatriFiscalRejection = {
  serviceListCodeMaxLength: {
    code: "SAATRI_ITEM_LISTA_SERVICO_MAX_LENGTH",
    message: "ItemListaServico deve ter no máximo 8 caracteres para SAATRI/ABRASF 2.03.",
    correctionHint: "Informe um código de lista de serviço com até 8 caracteres.",
  },
  nbsRequired2026: {
    code: "SAATRI_CODIGO_NBS_REQUIRED_2026",
    message: "CodigoNbs é obrigatório pela regra nacional compartilhada em 2026.",
    correctionHint: "Informe services[].nbsCode antes de emitir a NFS-e.",
  },
} satisfies Record<string, FiscalRejection>;

export const AbrasfRpsTypeValue = {
  rps: "1",
} satisfies Record<string, string>;

export const AbrasfRpsStatusValue = {
  normal: "1",
} satisfies Record<string, string>;

export const AbrasfYesNoCodeValue = {
  yes: "1",
  no: "2",
} satisfies Record<string, string>;

export const AbrasfIssWithheldValue = {
  yes: "1",
  no: "2",
} satisfies Record<string, string>;

export const AbrasfIssEnforceabilityValue = {
  taxable: "1",
} satisfies Record<string, string>;

const SAATRI_ABRASF_203_CAPABILITIES: readonly FiscalProviderCapability[] = [
  FiscalProviderCapabilityValue.issueNfse,
];

const SAATRI_ABRASF_203_CAPABILITY_METADATA: readonly FiscalProviderCapabilityMetadata[] = [
  {
    capability: FiscalProviderCapabilityValue.issueNfse,
    status: FiscalProviderCapabilityStatusValue.supported,
    environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
    reason:
      "Implementado via operação SAATRI GerarNfse ABRASF 2.03; respostas 2026 podem ficar pendentes por compartilhamento com ambiente nacional.",
    requiresSigner: false,
    requiresCertificateOutsideDFeKit: false,
  },
  {
    capability: FiscalProviderCapabilityValue.generateNfse,
    status: FiscalProviderCapabilityStatusValue.supported,
    environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
    reason: "Equivalente operacional a issue_nfse neste adapter.",
    requiresSigner: false,
    requiresCertificateOutsideDFeKit: false,
  },
  {
    capability: FiscalProviderCapabilityValue.queryNfseByRps,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
    reason:
      "Manual SAATRI lista ConsultaNfsePorRps, mas o fluxo ainda não tem implementação e prova automatizada.",
  },
  {
    capability: FiscalProviderCapabilityValue.submitRpsBatch,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista recepção de lote RPS, ainda não homologado no DFeKit.",
  },
  {
    capability: FiscalProviderCapabilityValue.submitRpsBatchSync,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista envio de lote síncrono, ainda não homologado no DFeKit.",
  },
  {
    capability: FiscalProviderCapabilityValue.queryRpsBatch,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista consulta de lote RPS, ainda não homologada no DFeKit.",
  },
  {
    capability: FiscalProviderCapabilityValue.queryIssuedNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista consulta de NFS-e prestadas, ainda não homologada no DFeKit.",
  },
  {
    capability: FiscalProviderCapabilityValue.queryReceivedNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista consulta de NFS-e tomadas, ainda não homologada no DFeKit.",
  },
  {
    capability: FiscalProviderCapabilityValue.queryNfseRange,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista consulta por faixa, ainda não homologada no DFeKit.",
  },
  {
    capability: FiscalProviderCapabilityValue.cancelNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista cancelamento, ainda não homologado no DFeKit.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.replaceNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason: "Manual lista substituição, ainda não homologada no DFeKit.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.issueNfe,
    status: FiscalProviderCapabilityStatusValue.unsupported,
    reason: "SAATRI é provider municipal de NFS-e, não NF-e modelo 55.",
  },
  {
    capability: FiscalProviderCapabilityValue.issueNfce,
    status: FiscalProviderCapabilityStatusValue.unsupported,
    reason: "SAATRI é provider municipal de NFS-e, não NFC-e modelo 65.",
  },
];

export { SAATRI_ABRASF_203_CAPABILITIES, SAATRI_ABRASF_203_CAPABILITY_METADATA };

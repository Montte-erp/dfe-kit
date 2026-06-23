import type { FiscalProviderError, IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { fiscalEnvironmentSchema } from "@dfe-kit/fiscal/schemas";
import { Effect, Schema } from "effect";

const defineSefazSchema = <T>(schema: Schema.Decoder<T>): Schema.Decoder<T> => schema;

const endpointUrl: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^https:\/\/.+/));

export type SefazDocumentKind = "nfe" | "nfce";
export const sefazDocumentKindSchema: Schema.Decoder<SefazDocumentKind> = Schema.Literals([
  "nfe",
  "nfce",
]);

export type SefazProviderErrorCode =
  | "sefaz.NETWORK_ERROR"
  | "sefaz.RESPONSE_READ_ERROR"
  | "sefaz.HTTP_STATUS_ERROR"
  | "sefaz.RESPONSE_SHAPE_ERROR"
  | "sefaz.REQUEST_BUILD_ERROR"
  | "sefaz.CONFIG_ERROR"
  | "sefaz.INVALID_INPUT";
export const sefazProviderErrorCodeSchema: Schema.Decoder<SefazProviderErrorCode> = Schema.Literals(
  [
    "sefaz.NETWORK_ERROR",
    "sefaz.RESPONSE_READ_ERROR",
    "sefaz.HTTP_STATUS_ERROR",
    "sefaz.RESPONSE_SHAPE_ERROR",
    "sefaz.REQUEST_BUILD_ERROR",
    "sefaz.CONFIG_ERROR",
    "sefaz.INVALID_INPUT",
  ],
);
export const SefazProviderErrorCodeValue = {
  networkError: "sefaz.NETWORK_ERROR",
  responseReadError: "sefaz.RESPONSE_READ_ERROR",
  httpStatusError: "sefaz.HTTP_STATUS_ERROR",
  responseShapeError: "sefaz.RESPONSE_SHAPE_ERROR",
  requestBuildError: "sefaz.REQUEST_BUILD_ERROR",
  configError: "sefaz.CONFIG_ERROR",
  invalidInput: "sefaz.INVALID_INPUT",
} satisfies Record<string, SefazProviderErrorCode>;

export type SefazOperation =
  | "schema_decode"
  | "request_build"
  | "http_post"
  | "http_response_text"
  | "response_parse";
export const sefazOperationSchema: Schema.Decoder<SefazOperation> = Schema.Literals([
  "schema_decode",
  "request_build",
  "http_post",
  "http_response_text",
  "response_parse",
]);
export const SefazOperationValue = {
  schemaDecode: "schema_decode",
  requestBuild: "request_build",
  httpPost: "http_post",
  httpResponseText: "http_response_text",
  responseParse: "response_parse",
} satisfies Record<string, SefazOperation>;

export type SefazPhase =
  | "provider_options_decode"
  | "environment_config_decode"
  | "issue_input_decode"
  | "issue_input_validation"
  | "request_xml"
  | "http_transport"
  | "http_status"
  | "http_timeout"
  | "http_response_body"
  | "response_body";
export const sefazPhaseSchema: Schema.Decoder<SefazPhase> = Schema.Literals([
  "provider_options_decode",
  "environment_config_decode",
  "issue_input_decode",
  "issue_input_validation",
  "request_xml",
  "http_transport",
  "http_status",
  "http_timeout",
  "http_response_body",
  "response_body",
]);
export const SefazPhaseValue = {
  providerOptionsDecode: "provider_options_decode",
  environmentConfigDecode: "environment_config_decode",
  issueInputDecode: "issue_input_decode",
  issueInputValidation: "issue_input_validation",
  requestXml: "request_xml",
  httpTransport: "http_transport",
  httpStatus: "http_status",
  httpTimeout: "http_timeout",
  httpResponseBody: "http_response_body",
  responseBody: "response_body",
} satisfies Record<string, SefazPhase>;

export type SefazSchemaName = "provider_options" | "environment_config" | "issue_input";
export const sefazSchemaNameSchema: Schema.Decoder<SefazSchemaName> = Schema.Literals([
  "provider_options",
  "environment_config",
  "issue_input",
]);
export const SefazSchemaNameValue = {
  providerOptions: "provider_options",
  environmentConfig: "environment_config",
  issueInput: "issue_input",
} satisfies Record<string, SefazSchemaName>;

export type SefazUpstreamTag =
  | "StatusCodeError"
  | "HttpClientError"
  | "TimeoutError"
  | "ResponseBodyError";
export const sefazUpstreamTagSchema: Schema.Decoder<SefazUpstreamTag> = Schema.Literals([
  "StatusCodeError",
  "HttpClientError",
  "TimeoutError",
  "ResponseBodyError",
]);
export const SefazUpstreamTagValue = {
  statusCodeError: "StatusCodeError",
  httpClientError: "HttpClientError",
  responseBodyError: "ResponseBodyError",
  timeoutError: "TimeoutError",
} satisfies Record<string, SefazUpstreamTag>;

export type SefazProviderErrorFields = {
  readonly _tag: "SefazProviderError";
  readonly code: SefazProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number | undefined;
  readonly reason?: string | undefined;
  readonly operation?: SefazOperation | undefined;
  readonly phase?: SefazPhase | undefined;
  readonly schemaName?: SefazSchemaName | undefined;
  readonly issuePath?: string | undefined;
  readonly issueMessage?: string | undefined;
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

type SefazProviderErrorInput = {
  readonly code: SefazProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number | undefined;
  readonly reason?: string | undefined;
  readonly operation?: SefazOperation | undefined;
  readonly phase?: SefazPhase | undefined;
  readonly schemaName?: SefazSchemaName | undefined;
  readonly issuePath?: string | undefined;
  readonly issueMessage?: string | undefined;
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

type SefazProviderErrorConstructor = new (
  input: SefazProviderErrorInput,
) => SefazProviderErrorFields;

const ProviderErrorBase: SefazProviderErrorConstructor =
  Schema.TaggedErrorClass<SefazProviderErrorFields>()("SefazProviderError", {
    code: sefazProviderErrorCodeSchema,
    retryable: Schema.Boolean,
    status: Schema.optional(Schema.Number),
    reason: Schema.optional(Schema.String),
    operation: Schema.optional(sefazOperationSchema),
    phase: Schema.optional(sefazPhaseSchema),
    schemaName: Schema.optional(sefazSchemaNameSchema),
    issuePath: Schema.optional(Schema.String),
    issueMessage: Schema.optional(Schema.String),
    upstreamTag: Schema.optional(Schema.String),
    upstreamCode: Schema.optional(Schema.String),
  });

export class SefazProviderError extends ProviderErrorBase implements FiscalProviderError {
  get message(): string {
    switch (this.code) {
      case "sefaz.NETWORK_ERROR":
        return this.reason ?? "Falha de rede ao comunicar com a SEFAZ.";
      case "sefaz.RESPONSE_READ_ERROR":
        return this.reason ?? "Não foi possível ler o corpo da resposta da SEFAZ.";
      case "sefaz.HTTP_STATUS_ERROR":
        return this.reason ?? `SEFAZ respondeu com status HTTP ${this.status}.`;
      case "sefaz.RESPONSE_SHAPE_ERROR":
        return this.reason ?? "Resposta da SEFAZ sem autorização nem rejeição fiscal reconhecida.";
      case "sefaz.REQUEST_BUILD_ERROR":
        return this.reason ?? "Falha ao construir XML/envelope assinado para SEFAZ.";
      case "sefaz.CONFIG_ERROR":
        return this.reason ?? "Configuração SEFAZ inválida.";
      case "sefaz.INVALID_INPUT":
        return this.reason ?? "Entrada fiscal inválida para SEFAZ.";
    }
  }
}

export type SefazAuthorizationEndpoints = {
  readonly nfe?: string | undefined;
  readonly nfce?: string | undefined;
};
export const sefazAuthorizationEndpointsSchema: Schema.Decoder<SefazAuthorizationEndpoints> =
  defineSefazSchema(
    Schema.Struct({
      nfe: Schema.optional(endpointUrl),
      nfce: Schema.optional(endpointUrl),
    }),
  );

export type SefazEnvironmentConfig = {
  readonly environment: "homologation" | "production";
  readonly authorizationEndpoints: SefazAuthorizationEndpoints;
};
export const sefazEnvironmentConfigSchema: Schema.Decoder<SefazEnvironmentConfig> =
  defineSefazSchema(
    Schema.Struct({
      environment: fiscalEnvironmentSchema,
      authorizationEndpoints: sefazAuthorizationEndpointsSchema,
    }),
  );

export type SefazSignedRequestXmlBuilder = (
  input: IssueFiscalDocumentInput,
) => Effect.Effect<string, SefazProviderError>;

export type SefazEventName =
  | "sefaz.issue_started"
  | "sefaz.request_build_started"
  | "sefaz.request_build_succeeded"
  | "sefaz.request_build_failed"
  | "sefaz.http_post_started"
  | "sefaz.http_post_succeeded"
  | "sefaz.http_post_failed"
  | "sefaz.fiscal_authorized"
  | "sefaz.fiscal_rejected"
  | "sefaz.issue_completed"
  | "sefaz.issue_failed";
export const sefazEventNameSchema: Schema.Decoder<SefazEventName> = Schema.Literals([
  "sefaz.issue_started",
  "sefaz.request_build_started",
  "sefaz.request_build_succeeded",
  "sefaz.request_build_failed",
  "sefaz.http_post_started",
  "sefaz.http_post_succeeded",
  "sefaz.http_post_failed",
  "sefaz.fiscal_authorized",
  "sefaz.fiscal_rejected",
  "sefaz.issue_completed",
  "sefaz.issue_failed",
]);
export const SefazEventNameValue = {
  issueStarted: "sefaz.issue_started",
  requestBuildStarted: "sefaz.request_build_started",
  requestBuildSucceeded: "sefaz.request_build_succeeded",
  requestBuildFailed: "sefaz.request_build_failed",
  httpPostStarted: "sefaz.http_post_started",
  httpPostSucceeded: "sefaz.http_post_succeeded",
  httpPostFailed: "sefaz.http_post_failed",
  fiscalAuthorized: "sefaz.fiscal_authorized",
  fiscalRejected: "sefaz.fiscal_rejected",
  issueCompleted: "sefaz.issue_completed",
  issueFailed: "sefaz.issue_failed",
} satisfies Record<string, SefazEventName>;

export type SefazEvent = {
  readonly name: SefazEventName;
  readonly providerId: string;
  readonly documentKind: string;
  readonly environment: string;
  readonly series: string;
  readonly number: string;
  readonly correlationId?: string | undefined;
};
export const sefazEventSchema: Schema.Decoder<SefazEvent> = defineSefazSchema(
  Schema.Struct({
    name: sefazEventNameSchema,
    providerId: Schema.String,
    documentKind: Schema.String,
    environment: Schema.String,
    series: Schema.String,
    number: Schema.String,
    correlationId: Schema.optional(Schema.String),
  }),
);

export type SefazEventSink = (event: SefazEvent) => Effect.Effect<void, never>;

export type CreateSefazProviderOptionsInput = {
  readonly environment: "homologation" | "production";
  readonly authorizationEndpoints: SefazAuthorizationEndpoints;
  readonly buildSignedRequestXml?: unknown;
  readonly eventSink?: unknown;
  readonly correlationId?: string | undefined;
};
export const createSefazProviderOptionsSchema: Schema.Decoder<CreateSefazProviderOptionsInput> =
  Schema.Struct({
    environment: fiscalEnvironmentSchema,
    authorizationEndpoints: sefazAuthorizationEndpointsSchema,
    buildSignedRequestXml: Schema.optional(Schema.Unknown),
    eventSink: Schema.optional(Schema.Unknown),
    correlationId: Schema.optional(Schema.String),
  });

export type CreateSefazProviderOptions = CreateSefazProviderOptionsInput & {
  readonly buildSignedRequestXml: SefazSignedRequestXmlBuilder;
  readonly eventSink?: SefazEventSink | undefined;
  readonly correlationId?: string | undefined;
};

const isSefazSignedRequestXmlBuilder = (
  builder: unknown,
): builder is SefazSignedRequestXmlBuilder => typeof builder === "function";

export const assertSefazSignedRequestXmlBuilder = (
  builder: unknown,
): Effect.Effect<SefazSignedRequestXmlBuilder, SefazProviderError> =>
  isSefazSignedRequestXmlBuilder(builder)
    ? Effect.succeed(builder)
    : Effect.fail(
        new SefazProviderError({
          code: SefazProviderErrorCodeValue.configError,
          retryable: false,
          reason:
            "SEFAZ exige buildSignedRequestXml Effect-native para gerar XML/envelope assinado fora do DFeKit.",
          operation: SefazOperationValue.schemaDecode,
          phase: SefazPhaseValue.providerOptionsDecode,
          schemaName: SefazSchemaNameValue.providerOptions,
        }),
      );

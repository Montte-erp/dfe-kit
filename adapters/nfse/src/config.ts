import type { FiscalProviderError, IssueFiscalDocumentInput } from "@dfe-kit/fiscal";
import { fiscalEnvironmentSchema } from "@dfe-kit/fiscal/schemas";
import { Effect, Schema } from "effect";

const defineNfseNacionalSchema = <T>(schema: Schema.Decoder<T>): Schema.Decoder<T> => schema;

const endpointUrl: Schema.Decoder<string> = Schema.String.check(Schema.isPattern(/^https:\/\/.+/));

export type NfseNacionalProviderErrorCode =
  | "nfse_nacional.NETWORK_ERROR"
  | "nfse_nacional.RESPONSE_READ_ERROR"
  | "nfse_nacional.HTTP_STATUS_ERROR"
  | "nfse_nacional.RESPONSE_SHAPE_ERROR"
  | "nfse_nacional.DPS_BUILD_ERROR"
  | "nfse_nacional.CONFIG_ERROR"
  | "nfse_nacional.INVALID_INPUT";
export const nfseNacionalProviderErrorCodeSchema: Schema.Decoder<NfseNacionalProviderErrorCode> =
  Schema.Literals([
    "nfse_nacional.NETWORK_ERROR",
    "nfse_nacional.RESPONSE_READ_ERROR",
    "nfse_nacional.HTTP_STATUS_ERROR",
    "nfse_nacional.RESPONSE_SHAPE_ERROR",
    "nfse_nacional.DPS_BUILD_ERROR",
    "nfse_nacional.CONFIG_ERROR",
    "nfse_nacional.INVALID_INPUT",
  ]);

export const NfseNacionalProviderErrorCodeValue = {
  networkError: "nfse_nacional.NETWORK_ERROR",
  responseReadError: "nfse_nacional.RESPONSE_READ_ERROR",
  httpStatusError: "nfse_nacional.HTTP_STATUS_ERROR",
  responseShapeError: "nfse_nacional.RESPONSE_SHAPE_ERROR",
  dpsBuildError: "nfse_nacional.DPS_BUILD_ERROR",
  configError: "nfse_nacional.CONFIG_ERROR",
  invalidInput: "nfse_nacional.INVALID_INPUT",
} satisfies Record<string, NfseNacionalProviderErrorCode>;

export type NfseNacionalOperation =
  | "schema_decode"
  | "dps_build"
  | "http_post"
  | "http_response_text"
  | "response_parse";
export const nfseNacionalOperationSchema: Schema.Decoder<NfseNacionalOperation> = Schema.Literals([
  "schema_decode",
  "dps_build",
  "http_post",
  "http_response_text",
  "response_parse",
]);
export const NfseNacionalOperationValue = {
  schemaDecode: "schema_decode",
  dpsBuild: "dps_build",
  httpPost: "http_post",
  httpResponseText: "http_response_text",
  responseParse: "response_parse",
} satisfies Record<string, NfseNacionalOperation>;

export type NfseNacionalPhase =
  | "provider_options_decode"
  | "environment_config_decode"
  | "issue_input_decode"
  | "issue_input_validation"
  | "dps_xml"
  | "http_transport"
  | "http_status"
  | "http_timeout"
  | "http_response_body"
  | "response_body";
export const nfseNacionalPhaseSchema: Schema.Decoder<NfseNacionalPhase> = Schema.Literals([
  "provider_options_decode",
  "environment_config_decode",
  "issue_input_decode",
  "issue_input_validation",
  "dps_xml",
  "http_transport",
  "http_status",
  "http_timeout",
  "http_response_body",
  "response_body",
]);
export const NfseNacionalPhaseValue = {
  providerOptionsDecode: "provider_options_decode",
  environmentConfigDecode: "environment_config_decode",
  issueInputDecode: "issue_input_decode",
  issueInputValidation: "issue_input_validation",
  dpsXml: "dps_xml",
  httpTransport: "http_transport",
  httpStatus: "http_status",
  httpTimeout: "http_timeout",
  httpResponseBody: "http_response_body",
  responseBody: "response_body",
} satisfies Record<string, NfseNacionalPhase>;

export type NfseNacionalSchemaName = "provider_options" | "environment_config" | "issue_input";
export const nfseNacionalSchemaNameSchema: Schema.Decoder<NfseNacionalSchemaName> = Schema.Literals(
  ["provider_options", "environment_config", "issue_input"],
);
export const NfseNacionalSchemaNameValue = {
  providerOptions: "provider_options",
  environmentConfig: "environment_config",
  issueInput: "issue_input",
} satisfies Record<string, NfseNacionalSchemaName>;

export type NfseNacionalUpstreamTag =
  | "StatusCodeError"
  | "HttpClientError"
  | "TimeoutError"
  | "ResponseBodyError";
export const nfseNacionalUpstreamTagSchema: Schema.Decoder<NfseNacionalUpstreamTag> =
  Schema.Literals(["StatusCodeError", "HttpClientError", "TimeoutError", "ResponseBodyError"]);
export const NfseNacionalUpstreamTagValue = {
  statusCodeError: "StatusCodeError",
  httpClientError: "HttpClientError",
  responseBodyError: "ResponseBodyError",
  timeoutError: "TimeoutError",
} satisfies Record<string, NfseNacionalUpstreamTag>;

type NfseNacionalProviderErrorFields = {
  readonly _tag: "NfseNacionalProviderError";
  readonly code: NfseNacionalProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number | undefined;
  readonly reason?: string | undefined;
  readonly operation?: NfseNacionalOperation | undefined;
  readonly phase?: NfseNacionalPhase | undefined;
  readonly schemaName?: NfseNacionalSchemaName | undefined;
  readonly issuePath?: string | undefined;
  readonly issueMessage?: string | undefined;
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

type NfseNacionalProviderErrorInput = {
  readonly code: NfseNacionalProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number | undefined;
  readonly reason?: string | undefined;
  readonly operation?: NfseNacionalOperation | undefined;
  readonly phase?: NfseNacionalPhase | undefined;
  readonly schemaName?: NfseNacionalSchemaName | undefined;
  readonly issuePath?: string | undefined;
  readonly issueMessage?: string | undefined;
  readonly upstreamTag?: string | undefined;
  readonly upstreamCode?: string | undefined;
};

type NfseNacionalProviderErrorConstructor = new (
  input: NfseNacionalProviderErrorInput,
) => NfseNacionalProviderErrorFields;

const ProviderErrorBase: NfseNacionalProviderErrorConstructor =
  Schema.TaggedErrorClass<NfseNacionalProviderErrorFields>()("NfseNacionalProviderError", {
    code: nfseNacionalProviderErrorCodeSchema,
    retryable: Schema.Boolean,
    status: Schema.optional(Schema.Number),
    reason: Schema.optional(Schema.String),
    operation: Schema.optional(nfseNacionalOperationSchema),
    phase: Schema.optional(nfseNacionalPhaseSchema),
    schemaName: Schema.optional(nfseNacionalSchemaNameSchema),
    issuePath: Schema.optional(Schema.String),
    issueMessage: Schema.optional(Schema.String),
    upstreamTag: Schema.optional(Schema.String),
    upstreamCode: Schema.optional(Schema.String),
  });

export class NfseNacionalProviderError extends ProviderErrorBase implements FiscalProviderError {
  get message(): string {
    switch (this.code) {
      case "nfse_nacional.NETWORK_ERROR":
        return this.reason ?? "Falha de rede ao comunicar com a Sefin Nacional.";
      case "nfse_nacional.RESPONSE_READ_ERROR":
        return this.reason ?? "Não foi possível ler o corpo da resposta da Sefin Nacional.";
      case "nfse_nacional.HTTP_STATUS_ERROR":
        return this.reason ?? `Sefin Nacional respondeu com status HTTP ${this.status}.`;
      case "nfse_nacional.RESPONSE_SHAPE_ERROR":
        return (
          this.reason ?? "Resposta da Sefin Nacional sem NFS-e autorizada nem rejeição fiscal."
        );
      case "nfse_nacional.DPS_BUILD_ERROR":
        return this.reason ?? "Falha ao construir DPS XML nacional.";
      case "nfse_nacional.CONFIG_ERROR":
        return this.reason ?? "Configuração NFS-e Nacional inválida.";
      case "nfse_nacional.INVALID_INPUT":
        return this.reason ?? "Entrada fiscal inválida para NFS-e Nacional.";
    }
  }
}

export type NfseNacionalDpsXmlBuilder = (
  input: IssueFiscalDocumentInput,
) => Effect.Effect<string, NfseNacionalProviderError>;

export type NfseNacionalEventName =
  | "nfse_nacional.issue_started"
  | "nfse_nacional.dps_build_started"
  | "nfse_nacional.dps_build_succeeded"
  | "nfse_nacional.dps_build_failed"
  | "nfse_nacional.http_post_started"
  | "nfse_nacional.http_post_succeeded"
  | "nfse_nacional.http_post_failed"
  | "nfse_nacional.fiscal_authorized"
  | "nfse_nacional.fiscal_rejected"
  | "nfse_nacional.issue_completed"
  | "nfse_nacional.issue_failed";
export const nfseNacionalEventNameSchema: Schema.Decoder<NfseNacionalEventName> = Schema.Literals([
  "nfse_nacional.issue_started",
  "nfse_nacional.dps_build_started",
  "nfse_nacional.dps_build_succeeded",
  "nfse_nacional.dps_build_failed",
  "nfse_nacional.http_post_started",
  "nfse_nacional.http_post_succeeded",
  "nfse_nacional.http_post_failed",
  "nfse_nacional.fiscal_authorized",
  "nfse_nacional.fiscal_rejected",
  "nfse_nacional.issue_completed",
  "nfse_nacional.issue_failed",
]);

export const NfseNacionalEventNameValue = {
  issueStarted: "nfse_nacional.issue_started",
  dpsBuildStarted: "nfse_nacional.dps_build_started",
  dpsBuildSucceeded: "nfse_nacional.dps_build_succeeded",
  dpsBuildFailed: "nfse_nacional.dps_build_failed",
  httpPostStarted: "nfse_nacional.http_post_started",
  httpPostSucceeded: "nfse_nacional.http_post_succeeded",
  httpPostFailed: "nfse_nacional.http_post_failed",
  fiscalAuthorized: "nfse_nacional.fiscal_authorized",
  fiscalRejected: "nfse_nacional.fiscal_rejected",
  issueCompleted: "nfse_nacional.issue_completed",
  issueFailed: "nfse_nacional.issue_failed",
} satisfies Record<string, NfseNacionalEventName>;

export type NfseNacionalEvent = {
  readonly name: NfseNacionalEventName;
  readonly providerId: string;
  readonly documentKind: string;
  readonly environment: string;
  readonly series: string;
  readonly number: string;
  readonly correlationId?: string | undefined;
};
export const nfseNacionalEventSchema: Schema.Decoder<NfseNacionalEvent> = defineNfseNacionalSchema(
  Schema.Struct({
    name: nfseNacionalEventNameSchema,
    providerId: Schema.String,
    documentKind: Schema.String,
    environment: Schema.String,
    series: Schema.String,
    number: Schema.String,
    correlationId: Schema.optional(Schema.String),
  }),
);

export type NfseNacionalEventSink = (event: NfseNacionalEvent) => Effect.Effect<void, never>;

export type NfseNacionalEnvironmentConfig = {
  readonly environment: (typeof fiscalEnvironmentSchema)["Type"];
  readonly endpoint: string;
};
export const nfseNacionalEnvironmentConfigSchema: Schema.Decoder<NfseNacionalEnvironmentConfig> =
  defineNfseNacionalSchema(
    Schema.Struct({
      environment: fiscalEnvironmentSchema,
      endpoint: endpointUrl,
    }),
  );

export type CreateNfseNacionalProviderOptionsInput = {
  readonly environment: (typeof fiscalEnvironmentSchema)["Type"];
  readonly buildDpsXml?: unknown | undefined;
  readonly eventSink?: unknown | undefined;
  readonly correlationId?: string | undefined;
};
export const createNfseNacionalProviderOptionsSchema: Schema.Decoder<CreateNfseNacionalProviderOptionsInput> =
  Schema.Struct({
    environment: fiscalEnvironmentSchema,
    buildDpsXml: Schema.optional(Schema.Unknown),
    eventSink: Schema.optional(Schema.Unknown),
    correlationId: Schema.optional(Schema.String),
  });

export type CreateNfseNacionalProviderOptions = CreateNfseNacionalProviderOptionsInput & {
  readonly buildDpsXml: NfseNacionalDpsXmlBuilder;
  readonly eventSink?: NfseNacionalEventSink | undefined;
  readonly correlationId?: string | undefined;
};

const isNfseNacionalDpsBuilder = (builder: unknown): builder is NfseNacionalDpsXmlBuilder =>
  typeof builder === "function";

export const assertNfseNacionalDpsBuilder = (
  builder: unknown,
): Effect.Effect<NfseNacionalDpsXmlBuilder, NfseNacionalProviderError> =>
  isNfseNacionalDpsBuilder(builder)
    ? Effect.succeed(builder)
    : Effect.fail(
        new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.configError,
          retryable: false,
          reason:
            "NFS-e Nacional exige buildDpsXml Effect-native para gerar DPS XML assinada fora do DFeKit.",
          operation: NfseNacionalOperationValue.schemaDecode,
          phase: NfseNacionalPhaseValue.providerOptionsDecode,
          schemaName: NfseNacionalSchemaNameValue.providerOptions,
        }),
      );

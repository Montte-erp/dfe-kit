import { safeCauseMetadata } from "@dfe-kit/fiscal/effect-error-metadata";
import { Context, Duration, Effect, Layer, Match, Schema, Schedule } from "effect";
import { FetchHttpClient, HttpBody, HttpClient, HttpClientResponse } from "effect/unstable/http";
import {
  NfseNacionalOperationValue,
  NfseNacionalPhaseValue,
  NfseNacionalProviderError,
  NfseNacionalProviderErrorCodeValue,
  NfseNacionalUpstreamTagValue,
} from "./config";

const DPS_XML_CONTENT_TYPE = "application/xml; charset=utf-8";
const ACCEPT_XML_OR_JSON = "application/xml, text/xml, application/json";

const defineHttpSchema = <T>(schema: Schema.Decoder<T>): Schema.Decoder<T> => schema;

const httpStatusSchema = defineHttpSchema<number>(
  Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
);

export type NfseNacionalHttpResponse = {
  readonly status: number;
  readonly body: string;
};
export const nfseNacionalHttpResponseSchema: Schema.Decoder<NfseNacionalHttpResponse> =
  defineHttpSchema(
    Schema.Struct({
      status: httpStatusSchema,
      body: Schema.String,
    }),
  );

export type NfseNacionalHttpClient = {
  postDpsXml(args: {
    readonly endpoint: string;
    readonly dpsXml: string;
  }): Effect.Effect<NfseNacionalHttpResponse, NfseNacionalProviderError>;
};

export const NfseNacionalHttpClientService: Context.Service<
  NfseNacionalHttpClient,
  NfseNacionalHttpClient
> = Context.Service<NfseNacionalHttpClient>("dfe-kit/nfse-nacional/NfseNacionalHttpClient");

export type CreateNfseNacionalHttpOptions = {
  readonly timeoutMs?: number | undefined;
  readonly maxRetries?: number | undefined;
  readonly retryBaseMillis?: number | undefined;
  readonly retryableStatus?: ReadonlySet<number> | undefined;
};
export const createNfseNacionalHttpOptionsSchema: Schema.Decoder<CreateNfseNacionalHttpOptions> =
  Schema.Struct({
    timeoutMs: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    maxRetries: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(-1))),
    retryBaseMillis: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    retryableStatus: Schema.optional(Schema.ReadonlySet(httpStatusSchema)),
  });

type NfseNacionalHttpConfig = {
  readonly timeout: Duration.Duration;
  readonly maxRetries: number;
  readonly retryBase: Duration.Duration;
  readonly retryableStatus: ReadonlySet<number>;
};

const NfseNacionalHttpClientRuntimeConfig: Context.Service<
  NfseNacionalHttpConfig,
  NfseNacionalHttpConfig
> = Context.Service<NfseNacionalHttpConfig>(
  "dfe-kit/nfse-nacional/NfseNacionalHttpClientRuntimeConfig",
);

const toRuntimeConfig = (options: CreateNfseNacionalHttpOptions = {}): NfseNacionalHttpConfig => ({
  timeout: Duration.millis(options.timeoutMs ?? 30_000),
  maxRetries: options.maxRetries ?? 2,
  retryBase: Duration.millis(options.retryBaseMillis ?? 250),
  retryableStatus: options.retryableStatus ?? new Set([408, 429, 500, 502, 503, 504]),
});

export const createNfseNacionalHttpClientConfigLayer = (
  options: CreateNfseNacionalHttpOptions = {},
): Layer.Layer<NfseNacionalHttpConfig> =>
  Layer.succeed(NfseNacionalHttpClientRuntimeConfig, toRuntimeConfig(options));

export const createNfseNacionalHttpClientLayerFromClient = (
  client: NfseNacionalHttpClient,
): Layer.Layer<NfseNacionalHttpClient> => Layer.succeed(NfseNacionalHttpClientService, client);

const shouldRetryNfseNacionalHttp = (
  config: NfseNacionalHttpConfig,
  error: NfseNacionalProviderError,
): boolean =>
  error.code === NfseNacionalProviderErrorCodeValue.networkError ||
  (error.code === NfseNacionalProviderErrorCodeValue.httpStatusError &&
    config.retryableStatus.has(error.status ?? -1));

const postDpsXmlWithClient = (
  client: HttpClient.HttpClient,
  config: NfseNacionalHttpConfig,
  { endpoint, dpsXml }: Parameters<NfseNacionalHttpClient["postDpsXml"]>[0],
): Effect.Effect<NfseNacionalHttpResponse, NfseNacionalProviderError> =>
  Effect.gen(function* () {
    const response = yield* client
      .post(endpoint, {
        body: HttpBody.text(dpsXml, DPS_XML_CONTENT_TYPE),
        headers: { Accept: ACCEPT_XML_OR_JSON },
      })
      .pipe(
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.mapError((error) =>
          Match.value(error.reason).pipe(
            Match.tag(
              NfseNacionalUpstreamTagValue.statusCodeError,
              (reason) =>
                new NfseNacionalProviderError({
                  code: NfseNacionalProviderErrorCodeValue.httpStatusError,
                  retryable: config.retryableStatus.has(reason.response.status),
                  status: reason.response.status,
                  reason: `Sefin Nacional respondeu com status HTTP ${reason.response.status}.`,
                  operation: NfseNacionalOperationValue.httpPost,
                  phase: NfseNacionalPhaseValue.httpStatus,
                  ...safeCauseMetadata(reason),
                }),
            ),
            Match.orElse((reason) => {
              const metadata = safeCauseMetadata(reason);
              return new NfseNacionalProviderError({
                code: NfseNacionalProviderErrorCodeValue.networkError,
                retryable: true,
                reason: "Falha de rede ao comunicar com a Sefin Nacional.",
                operation: NfseNacionalOperationValue.httpPost,
                phase: NfseNacionalPhaseValue.httpTransport,
                upstreamTag: metadata.upstreamTag ?? NfseNacionalUpstreamTagValue.httpClientError,
                upstreamCode: metadata.upstreamCode,
              });
            }),
          ),
        ),
        Effect.timeout(config.timeout),
        Effect.catchTag(NfseNacionalUpstreamTagValue.timeoutError, () =>
          Effect.fail(
            new NfseNacionalProviderError({
              code: NfseNacionalProviderErrorCodeValue.networkError,
              retryable: true,
              reason: "Timeout na requisição ao serviço nacional de NFS-e.",
              operation: NfseNacionalOperationValue.httpPost,
              phase: NfseNacionalPhaseValue.httpTimeout,
              upstreamTag: NfseNacionalUpstreamTagValue.timeoutError,
            }),
          ),
        ),
        Effect.retry({
          schedule: Schedule.exponential(config.retryBase),
          times: config.maxRetries,
          while: (error) => shouldRetryNfseNacionalHttp(config, error),
        }),
      );

    const body = yield* response.text.pipe(
      Effect.mapError((cause) => {
        const metadata = safeCauseMetadata(cause);
        return new NfseNacionalProviderError({
          code: NfseNacionalProviderErrorCodeValue.responseReadError,
          retryable: false,
          reason: "Não foi possível ler o corpo da resposta da Sefin Nacional.",
          operation: NfseNacionalOperationValue.httpResponseText,
          phase: NfseNacionalPhaseValue.httpResponseBody,
          upstreamTag: metadata.upstreamTag ?? NfseNacionalUpstreamTagValue.responseBodyError,
          upstreamCode: metadata.upstreamCode,
        });
      }),
    );

    return { status: response.status, body };
  }).pipe(
    Effect.withSpan("nfse_nacional.http_post", {
      attributes: {
        http_request_method: "POST",
        timeout_ms: Duration.toMillis(config.timeout),
        max_retries: config.maxRetries,
      },
    }),
  );

const makeNfseNacionalHttpClient: Effect.Effect<
  NfseNacionalHttpClient,
  never,
  NfseNacionalHttpConfig | HttpClient.HttpClient
> = Effect.gen(function* () {
  const config = yield* NfseNacionalHttpClientRuntimeConfig;
  const client = yield* HttpClient.HttpClient;
  return {
    postDpsXml: (args) => postDpsXmlWithClient(client, config, args),
  };
});

export const createNfseNacionalHttpClientLayer = (
  options: CreateNfseNacionalHttpOptions = {},
): Layer.Layer<NfseNacionalHttpClient, never, HttpClient.HttpClient> =>
  Layer.effect(NfseNacionalHttpClientService, makeNfseNacionalHttpClient).pipe(
    Layer.provide(createNfseNacionalHttpClientConfigLayer(options)),
  );

export const createNfseNacionalFetchHttpClientLayer = (
  options: CreateNfseNacionalHttpOptions = {},
): Layer.Layer<NfseNacionalHttpClient> =>
  createNfseNacionalHttpClientLayer(options).pipe(Layer.provide(FetchHttpClient.layer));

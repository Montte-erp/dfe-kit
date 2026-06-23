import { Context, Duration, Effect, Layer, Match, Schema, Schedule } from "effect";
import { FetchHttpClient, HttpBody, HttpClient, HttpClientResponse } from "effect/unstable/http";
import {
  SefazOperationValue,
  SefazPhaseValue,
  SefazProviderError,
  SefazProviderErrorCodeValue,
  SefazUpstreamTagValue,
} from "./config";

const SEFAZ_XML_CONTENT_TYPE = "application/soap+xml; charset=utf-8";
const ACCEPT_XML = "application/soap+xml, text/xml, application/xml";

const httpStatusSchema: Schema.Codec<number, unknown> = Schema.Number.check(
  Schema.isInt(),
  Schema.isGreaterThan(0),
);

export type SefazHttpResponse = {
  readonly status: number;
  readonly body: string;
};
export const sefazHttpResponseSchema: Schema.Codec<SefazHttpResponse, unknown> = Schema.Struct({
  status: httpStatusSchema,
  body: Schema.String,
});

export type SefazHttpClient = {
  postAuthorizationXml(args: {
    readonly endpoint: string;
    readonly requestXml: string;
  }): Effect.Effect<SefazHttpResponse, SefazProviderError>;
};

export const SefazHttpClientService: Context.Service<SefazHttpClient, SefazHttpClient> =
  Context.Service<SefazHttpClient>("dfe-kit/sefaz/SefazHttpClient");

export type CreateSefazHttpOptions = {
  readonly timeoutMs?: number | undefined;
  readonly maxRetries?: number | undefined;
  readonly retryBaseMillis?: number | undefined;
  readonly retryableStatus?: ReadonlySet<number> | undefined;
};

export const createSefazHttpOptionsSchema: Schema.Codec<CreateSefazHttpOptions, unknown> =
  Schema.Struct({
    timeoutMs: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    maxRetries: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(-1))),
    retryBaseMillis: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    retryableStatus: Schema.optional(Schema.ReadonlySet(httpStatusSchema)),
  });

type SefazHttpRuntime = {
  readonly timeout: Duration.Duration;
  readonly maxRetries: number;
  readonly retryBase: Duration.Duration;
  readonly retryableStatus: ReadonlySet<number>;
};

const SefazHttpRuntimeConfig: Context.Service<SefazHttpRuntime, SefazHttpRuntime> =
  Context.Service<SefazHttpRuntime>("dfe-kit/sefaz/SefazHttpRuntimeConfig");

const toRuntimeConfig = (options: CreateSefazHttpOptions = {}): SefazHttpRuntime => ({
  timeout: Duration.millis(options.timeoutMs ?? 30_000),
  maxRetries: options.maxRetries ?? 2,
  retryBase: Duration.millis(options.retryBaseMillis ?? 250),
  retryableStatus: options.retryableStatus ?? new Set([408, 429, 500, 502, 503, 504]),
});

export const createSefazHttpClientConfigLayer = (
  options: CreateSefazHttpOptions = {},
): Layer.Layer<SefazHttpRuntime> => Layer.succeed(SefazHttpRuntimeConfig, toRuntimeConfig(options));

export const createSefazHttpClientLayerFromClient = (
  client: SefazHttpClient,
): Layer.Layer<SefazHttpClient> => Layer.succeed(SefazHttpClientService, client);

const shouldRetrySefazHttp = (config: SefazHttpRuntime, error: SefazProviderError): boolean =>
  error.code === SefazProviderErrorCodeValue.networkError ||
  (error.code === SefazProviderErrorCodeValue.httpStatusError &&
    config.retryableStatus.has(error.status ?? -1));

const postAuthorizationXmlWithClient = (
  client: HttpClient.HttpClient,
  config: SefazHttpRuntime,
  { endpoint, requestXml }: Parameters<SefazHttpClient["postAuthorizationXml"]>[0],
): Effect.Effect<SefazHttpResponse, SefazProviderError> =>
  Effect.gen(function* () {
    const response = yield* client
      .post(endpoint, {
        body: HttpBody.text(requestXml, SEFAZ_XML_CONTENT_TYPE),
        headers: { Accept: ACCEPT_XML },
      })
      .pipe(
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.mapError((error) =>
          Match.value(error.reason).pipe(
            Match.tag(
              SefazUpstreamTagValue.statusCodeError,
              (reason) =>
                new SefazProviderError({
                  code: SefazProviderErrorCodeValue.httpStatusError,
                  retryable: config.retryableStatus.has(reason.response.status),
                  status: reason.response.status,
                  reason: `SEFAZ respondeu com status HTTP ${reason.response.status}.`,
                  operation: SefazOperationValue.httpPost,
                  phase: SefazPhaseValue.httpStatus,
                  upstreamTag: SefazUpstreamTagValue.statusCodeError,
                }),
            ),
            Match.orElse(
              () =>
                new SefazProviderError({
                  code: SefazProviderErrorCodeValue.networkError,
                  retryable: true,
                  reason: "Falha de rede ao comunicar com a SEFAZ.",
                  operation: SefazOperationValue.httpPost,
                  phase: SefazPhaseValue.httpTransport,
                  upstreamTag: SefazUpstreamTagValue.httpClientError,
                }),
            ),
          ),
        ),
        Effect.timeout(config.timeout),
        Effect.catchTag(SefazUpstreamTagValue.timeoutError, () =>
          Effect.fail(
            new SefazProviderError({
              code: SefazProviderErrorCodeValue.networkError,
              retryable: true,
              reason: "Timeout na requisição ao serviço SEFAZ.",
              operation: SefazOperationValue.httpPost,
              phase: SefazPhaseValue.httpTimeout,
              upstreamTag: SefazUpstreamTagValue.timeoutError,
            }),
          ),
        ),
        Effect.retry({
          schedule: Schedule.exponential(config.retryBase),
          times: config.maxRetries,
          while: (error) => shouldRetrySefazHttp(config, error),
        }),
      );

    const body = yield* response.text.pipe(
      Effect.mapError(
        () =>
          new SefazProviderError({
            code: SefazProviderErrorCodeValue.responseReadError,
            retryable: false,
            reason: "Não foi possível ler o corpo da resposta da SEFAZ.",
            operation: SefazOperationValue.httpResponseText,
            phase: SefazPhaseValue.httpResponseBody,
            upstreamTag: SefazUpstreamTagValue.responseBodyError,
          }),
      ),
    );

    return { status: response.status, body };
  }).pipe(
    Effect.withSpan("sefaz.http_post", {
      attributes: {
        http_request_method: "POST",
        timeout_ms: Duration.toMillis(config.timeout),
        max_retries: config.maxRetries,
      },
    }),
  );

const makeSefazHttpClient: Effect.Effect<
  SefazHttpClient,
  never,
  SefazHttpRuntime | HttpClient.HttpClient
> = Effect.gen(function* () {
  const config = yield* SefazHttpRuntimeConfig;
  const client = yield* HttpClient.HttpClient;
  return {
    postAuthorizationXml: (args) => postAuthorizationXmlWithClient(client, config, args),
  };
});

export const createSefazHttpClientLayer = (
  options: CreateSefazHttpOptions = {},
): Layer.Layer<SefazHttpClient, never, HttpClient.HttpClient> =>
  Layer.effect(SefazHttpClientService, makeSefazHttpClient).pipe(
    Layer.provide(createSefazHttpClientConfigLayer(options)),
  );

export const createSefazFetchHttpClientLayer = (
  options: CreateSefazHttpOptions = {},
): Layer.Layer<SefazHttpClient> =>
  createSefazHttpClientLayer(options).pipe(Layer.provide(FetchHttpClient.layer));

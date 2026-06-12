import { Context, Duration, Effect, Layer, Match, Metric, Schema, Schedule } from "effect";
import { FetchHttpClient, HttpBody, HttpClient, HttpClientResponse } from "effect/unstable/http";
import {
  SaatriOperationValue,
  SaatriPhaseValue,
  SaatriProviderError,
  SaatriProviderErrorCodeValue,
  SaatriUpstreamTagValue,
  safeCauseMetadata,
} from "./config";
import {
  SaatriAttributeNameValue,
  SaatriSpanNameValue,
  saatriHttpAttemptTotal,
  saatriHttpRetryTotal,
  saatriHttpStatusTotal,
} from "./observability";

const SOAP_CONTENT_TYPE = "text/xml; charset=utf-8";

const defineHttpSchema = <T>(schema: Schema.Schema<T>): Schema.Schema<T> => schema;

const httpStatusSchema = defineHttpSchema<number>(
  Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
);

type SaatriHttpClientRuntimeConfigInput = {
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly retryBaseMillis: number;
  readonly retryableStatus: ReadonlySet<number>;
};

const SaatriHttpClientOptionsSchema = defineHttpSchema<SaatriHttpClientRuntimeConfigInput>(
  Schema.Struct({
    timeoutMs: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
    maxRetries: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(-1)),
    retryBaseMillis: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
    retryableStatus: Schema.ReadonlySet(httpStatusSchema),
  }),
);
export const saatriHttpClientRuntimeConfigSchema: Schema.Schema<SaatriHttpClientRuntimeConfigInput> =
  SaatriHttpClientOptionsSchema;
type SaatriHttpConfig = {
  readonly timeout: Duration.Duration;
  readonly maxRetries: number;
  readonly retryBase: Duration.Duration;
  readonly retryableStatus: ReadonlySet<number>;
};

const createSaatriHttpClientOptionsSchema = defineHttpSchema<CreateSaatriHttpOptions>(
  Schema.Struct({
    timeoutMs: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    maxRetries: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(-1))),
    retryBaseMillis: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0))),
    retryableStatus: Schema.optional(Schema.ReadonlySet(httpStatusSchema)),
  }),
);
export const createSaatriHttpOptionsSchema: Schema.Schema<CreateSaatriHttpOptions> =
  createSaatriHttpClientOptionsSchema;
export type CreateSaatriHttpOptions = {
  readonly timeoutMs?: number | undefined;
  readonly maxRetries?: number | undefined;
  readonly retryBaseMillis?: number | undefined;
  readonly retryableStatus?: ReadonlySet<number> | undefined;
};
const SaatriHttpClientRuntimeConfig: Context.Service<SaatriHttpConfig, SaatriHttpConfig> =
  Context.Service<SaatriHttpConfig>("dfe-kit/saatri/SaatriHttpClientRuntimeConfig");

export type SaatriHttpClient = {
  postSoap(args: {
    readonly endpoint: string;
    readonly soapAction: string;
    readonly envelope: string;
  }): Effect.Effect<string, SaatriProviderError>;
};

export const SaatriHttpClient: Context.Service<SaatriHttpClient, SaatriHttpClient> =
  Context.Service<SaatriHttpClient>("dfe-kit/saatri/SaatriHttpClient");

const toRuntimeConfig = (options: CreateSaatriHttpOptions = {}): SaatriHttpConfig => ({
  timeout: Duration.millis(options.timeoutMs ?? 30_000),
  maxRetries: options.maxRetries ?? 2,
  retryBase: Duration.millis(options.retryBaseMillis ?? 250),
  retryableStatus: options.retryableStatus ?? new Set([408, 429, 500, 502, 503, 504]),
});

export const createSaatriHttpClientConfigLayer = (
  options: CreateSaatriHttpOptions = {},
): Layer.Layer<SaatriHttpConfig> =>
  Layer.succeed(SaatriHttpClientRuntimeConfig, toRuntimeConfig(options));

const shouldRetrySaatriHttp = (config: SaatriHttpConfig, error: SaatriProviderError): boolean =>
  error.code === SaatriProviderErrorCodeValue.networkError ||
  (error.code === SaatriProviderErrorCodeValue.httpStatusError &&
    config.retryableStatus.has(error.status ?? -1));

const postSoapWithClient = (
  client: HttpClient.HttpClient,
  config: SaatriHttpConfig,
  { endpoint, soapAction, envelope }: Parameters<SaatriHttpClient["postSoap"]>[0],
): Effect.Effect<string, SaatriProviderError> =>
  Effect.gen(function* () {
    const response = yield* Metric.update(saatriHttpAttemptTotal, 1).pipe(
      Effect.andThen(
        client.post(endpoint, {
          body: HttpBody.text(envelope, SOAP_CONTENT_TYPE),
          headers: { SOAPAction: `"${soapAction}"` },
        }),
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.mapError((error) =>
        Match.value(error.reason).pipe(
          Match.tag(
            SaatriUpstreamTagValue.statusCodeError,
            (reason) =>
              new SaatriProviderError({
                code: SaatriProviderErrorCodeValue.httpStatusError,
                retryable: config.retryableStatus.has(reason.response.status),
                status: reason.response.status,
                reason: `Servidor SAATRI respondeu com status HTTP ${reason.response.status}.`,
                operation: SaatriOperationValue.httpPost,
                phase: SaatriPhaseValue.httpStatus,
                ...safeCauseMetadata(reason),
              }),
          ),
          Match.orElse((reason) => {
            const metadata = safeCauseMetadata(reason);
            return new SaatriProviderError({
              code: SaatriProviderErrorCodeValue.networkError,
              retryable: true,
              reason: "Falha de rede ao comunicar com o servidor SAATRI.",
              operation: SaatriOperationValue.httpPost,
              phase: SaatriPhaseValue.httpTransport,
              upstreamTag: metadata.upstreamTag ?? SaatriUpstreamTagValue.httpClientError,
              upstreamCode: metadata.upstreamCode,
            });
          }),
        ),
      ),
      Effect.timeout(config.timeout),
      Effect.catchTag(SaatriUpstreamTagValue.timeoutError, () =>
        Effect.fail(
          new SaatriProviderError({
            code: SaatriProviderErrorCodeValue.networkError,
            retryable: true,
            reason: "Timeout na requisição ao serviço SAATRI.",
            operation: SaatriOperationValue.httpPost,
            phase: SaatriPhaseValue.httpTimeout,
            upstreamTag: SaatriUpstreamTagValue.timeoutError,
          }),
        ),
      ),
      Effect.tapError((error) =>
        shouldRetrySaatriHttp(config, error)
          ? Metric.update(
              Metric.withAttributes(saatriHttpRetryTotal, {
                code: error.code,
                phase: error.phase ?? "unknown",
                retryable: error.retryable ? "true" : "false",
              }),
              1,
            )
          : Effect.void,
      ),
      Effect.retry({
        schedule: Schedule.exponential(config.retryBase),
        times: config.maxRetries,
        while: (error) => shouldRetrySaatriHttp(config, error),
      }),
    );

    yield* Metric.update(
      Metric.withAttributes(saatriHttpStatusTotal, {
        status: `${response.status}`,
      }),
      1,
    );

    return yield* response.text.pipe(
      Effect.mapError((cause) => {
        const metadata = safeCauseMetadata(cause);
        return new SaatriProviderError({
          code: SaatriProviderErrorCodeValue.responseReadError,
          retryable: false,
          reason: "Não foi possível ler o corpo da resposta SAATRI.",
          operation: SaatriOperationValue.httpResponseText,
          phase: SaatriPhaseValue.httpResponseBody,
          upstreamTag: metadata.upstreamTag ?? SaatriUpstreamTagValue.responseBodyError,
          upstreamCode: metadata.upstreamCode,
        });
      }),
    );
  }).pipe(
    Effect.withSpan(SaatriSpanNameValue.httpPost, {
      attributes: {
        [SaatriAttributeNameValue.httpRequestMethod]: "POST",
        [SaatriAttributeNameValue.timeoutMs]: Duration.toMillis(config.timeout),
        [SaatriAttributeNameValue.maxRetries]: config.maxRetries,
      },
    }),
  );

const makeSaatriHttpClient: Effect.Effect<
  SaatriHttpClient,
  never,
  SaatriHttpConfig | HttpClient.HttpClient
> = Effect.gen(function* () {
  const config = yield* SaatriHttpClientRuntimeConfig;
  const client = yield* HttpClient.HttpClient;
  return {
    postSoap: (args) => postSoapWithClient(client, config, args),
  };
});

export const createSaatriHttpClientLayer = (
  options: CreateSaatriHttpOptions = {},
): Layer.Layer<SaatriHttpClient, never, HttpClient.HttpClient> =>
  Layer.effect(SaatriHttpClient, makeSaatriHttpClient).pipe(
    Layer.provide(createSaatriHttpClientConfigLayer(options)),
  );

export const createSaatriFetchHttpClientLayer = (
  options: CreateSaatriHttpOptions = {},
): Layer.Layer<SaatriHttpClient> =>
  createSaatriHttpClientLayer(options).pipe(Layer.provide(FetchHttpClient.layer));

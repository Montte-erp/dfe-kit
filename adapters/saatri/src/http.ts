import type { FiscalProviderError } from "@dfekit/fiscal";
import { Result } from "better-result";
import ky, { type KyInstance } from "ky";
import { saatriErrorCatalog } from "./config";

const SOAP_CONTENT_TYPE = "text/xml; charset=utf-8";
const DEFAULT_TIMEOUT_MS = 30_000;

export interface SaatriHttpClient {
  postSoap(args: {
    readonly endpoint: string;
    readonly soapAction: string;
    readonly envelope: string;
  }): Promise<Result<string, FiscalProviderError>>;
}

export interface CreateSaatriHttpOptions {
  readonly timeoutMs?: number;
  readonly kyInstance?: KyInstance;
}

const createKyInstance = (timeoutMs: number): KyInstance =>
  ky.create({
    timeout: timeoutMs,
    throwHttpErrors: false,
    retry: 0,
    headers: { "Content-Type": SOAP_CONTENT_TYPE },
  });

const readResponseText = (response: Response): Promise<Result<string, FiscalProviderError>> =>
  Result.tryPromise({
    try: () => response.text(),
    catch: () => ({
      code: saatriErrorCatalog.RESPONSE_READ_ERROR.code,
      message: saatriErrorCatalog.RESPONSE_READ_ERROR().message,
      retryable: true,
    }),
  });

export const createSaatriHttpClient = (options: CreateSaatriHttpOptions = {}): SaatriHttpClient => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = options.kyInstance ?? createKyInstance(timeoutMs);

  return {
    postSoap: ({ endpoint, soapAction, envelope }) =>
      Result.gen(async function* () {
        const response = yield* Result.await(
          Result.tryPromise({
            try: () =>
              client.post(endpoint, {
                body: envelope,
                headers: {
                  "Content-Type": SOAP_CONTENT_TYPE,
                  SOAPAction: `"${soapAction}"`,
                },
              }),
            catch: () => ({
              code: saatriErrorCatalog.NETWORK_ERROR.code,
              message: saatriErrorCatalog.NETWORK_ERROR().message,
              retryable: true,
            }),
          }),
        );

        if (!response.ok) {
          return yield* Result.err({
            code: saatriErrorCatalog.HTTP_STATUS_ERROR.code,
            message: saatriErrorCatalog.HTTP_STATUS_ERROR({ status: response.status }).message,
            retryable: true,
          });
        }

        const responseText = yield* Result.await(readResponseText(response));
        return Result.ok(responseText);
      }),
  };
};

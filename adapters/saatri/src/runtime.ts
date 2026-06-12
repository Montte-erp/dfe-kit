import { Effect } from "effect";
import {
  createSaatriFetchHttpClientLayer,
  type CreateSaatriHttpOptions,
  SaatriHttpClient,
} from "./http";

type RuntimeSaatriHttpClient = {
  postSoap(args: {
    readonly endpoint: string;
    readonly soapAction: string;
    readonly envelope: string;
  }): Effect.Effect<string, import("./config").SaatriProviderError>;
};

export const withSaatriFetchHttpClient = <A, E>(
  effect: Effect.Effect<A, E, RuntimeSaatriHttpClient>,
  options: CreateSaatriHttpOptions = {},
): Effect.Effect<A, E> =>
  effect.pipe(
    // effect-boundary: runtime convenience fecha transporte fetch padrão [allow-provide]
    Effect.provide(createSaatriFetchHttpClientLayer(options)),
  );

export const createSaatriHttpClient = (
  options: CreateSaatriHttpOptions = {},
): RuntimeSaatriHttpClient => ({
  postSoap: (args) =>
    withSaatriFetchHttpClient(
      Effect.flatMap(SaatriHttpClient, (http) => http.postSoap(args)),
      options,
    ),
});

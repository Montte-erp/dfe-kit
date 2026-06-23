import { Resource } from "alchemy";
import { havePropsChanged, isResolved } from "alchemy/Diff";
import type { Diff } from "alchemy/Diff";
import * as Provider from "alchemy/Provider";
import type { Resource as AlchemyResource, ResourceClass } from "alchemy";
import { Effect, Layer, Schema } from "effect";
import {
  FiscalProviderService,
  type FiscalProvider,
  type IssueFiscalDocumentInput,
  type IssueFiscalDocumentResponse,
} from "./index";
import { issueFiscalDocumentInputSchema, issueFiscalDocumentResponseSchema } from "./schemas";

export type FiscalDocument = AlchemyResource<
  "DFeKit.FiscalDocument",
  IssueFiscalDocumentInput,
  IssueFiscalDocumentResponse
>;

export const FiscalDocument: ResourceClass<FiscalDocument> = Resource<FiscalDocument>(
  "DFeKit.FiscalDocument",
  {
    defaultRemovalPolicy: "retain",
  },
);

const decodeIssueInput = Schema.decodeUnknownEffect(issueFiscalDocumentInputSchema);
const decodeIssueResponse = Schema.decodeUnknownEffect(issueFiscalDocumentResponseSchema);
const replaceDocument: Diff = { action: "replace" };
const keepDocument: Diff = { action: "noop" };

export const FiscalDocumentProvider = (): Layer.Layer<
  Provider.Provider<FiscalDocument>,
  never,
  FiscalProvider
> =>
  Provider.effect(
    FiscalDocument,
    Effect.gen(function* () {
      const fiscalProvider = yield* FiscalProviderService;

      return FiscalDocument.Provider.of({
        nuke: { skip: true },
        stables: ["documentRef", "providerResponse"],
        list: () => Effect.succeed([]),
        diff: ({ news, olds, output }) =>
          Effect.succeed(
            isResolved(news) && olds !== undefined && output !== undefined
              ? havePropsChanged(olds, news)
                ? replaceDocument
                : keepDocument
              : undefined,
          ),
        read: Effect.fn(function* ({ output }) {
          if (output === undefined) {
            return undefined;
          }
          return yield* decodeIssueResponse(output);
        }),
        reconcile: Effect.fn(function* ({ news, output }) {
          if (output !== undefined) {
            return yield* decodeIssueResponse(output);
          }
          const input = yield* decodeIssueInput(news);
          const response = yield* fiscalProvider.issue(input);
          return yield* decodeIssueResponse(response);
        }),
        delete: () => Effect.void,
      });
    }),
  );

export interface DfeKitAlchemyProviders extends Provider.ProviderCollection<
  DfeKitAlchemyProviders,
  "DFeKit"
> {}

export const DfeKitAlchemyProviders: Provider.ProviderCollection<DfeKitAlchemyProviders, "DFeKit"> =
  Provider.ProviderCollection<DfeKitAlchemyProviders>()("DFeKit");

export const createDfeKitAlchemyProviders = (): Layer.Layer<
  DfeKitAlchemyProviders,
  never,
  FiscalProvider
> =>
  Layer.effect(DfeKitAlchemyProviders, Provider.collection([FiscalDocument])).pipe(
    Layer.provide(FiscalDocumentProvider()),
  );

export type DfeKitAlchemyProviderRequirements = Layer.Services<
  ReturnType<typeof createDfeKitAlchemyProviders>
>;

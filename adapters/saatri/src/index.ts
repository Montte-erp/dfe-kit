import type {
  FiscalEnvironment,
  FiscalProvider,
  FiscalProviderCapabilityMetadata,
} from "@dfe-kit/fiscal";
import { panic } from "better-result";
import {
  configureSaatriManifest,
  SAATRI_ABRASF_VERSION,
  type SaatriCredentials,
  type SaatriEnvironmentConfig,
  type SaatriEventSink,
} from "./config";
import { buildGerarNfseEnvelope, type GerarNfseSigner, SOAP_ACTION_GERAR_NFSE } from "./envelope";
import {
  createSaatriHttpClient,
  type CreateSaatriHttpOptions,
  type SaatriHttpClient,
} from "./http";
import { parseGerarNfseResponse } from "./parse";
import { createSaatriProvider } from "./provider";

export interface SaatriProviderPackageConfig {
  readonly providerId: string;
  readonly providerName: string;
  readonly cityCode: string;
  readonly endpoints: Readonly<Record<FiscalEnvironment, string>>;
  readonly extraCapabilityMetadata?: readonly FiscalProviderCapabilityMetadata[];
}

export interface CreateSaatriPackageProviderOptions {
  readonly environment: FiscalEnvironment;
  readonly signer?: GerarNfseSigner;
  readonly timeoutMs?: number;
  readonly eventSink?: SaatriEventSink;
}

export interface ConfiguredSaatriProviderPackage {
  readonly manifest: ReturnType<typeof configureSaatriManifest>;
  createProvider(
    credentials: SaatriCredentials,
    options: CreateSaatriPackageProviderOptions,
  ): FiscalProvider;
}

export const configureSaatriProviderPackage = (
  packageConfig: SaatriProviderPackageConfig,
): ConfiguredSaatriProviderPackage => {
  const manifest = configureSaatriManifest({
    providerId: packageConfig.providerId,
    providerName: packageConfig.providerName,
    ...(packageConfig.extraCapabilityMetadata !== undefined
      ? { extraCapabilityMetadata: packageConfig.extraCapabilityMetadata }
      : {}),
  });

  return {
    manifest,
    createProvider: (credentials, options) => {
      const endpoint = packageConfig.endpoints[options.environment];
      if (endpoint === undefined) {
        panic(`Missing SAATRI endpoint for environment: ${options.environment}`);
      }

      const config: SaatriEnvironmentConfig = {
        environment: options.environment,
        endpoint,
        cityCode: packageConfig.cityCode,
      };
      const httpOptions: CreateSaatriHttpOptions =
        options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs };
      const http = createSaatriHttpClient(httpOptions);

      return createSaatriProvider({
        manifest,
        http,
        config,
        credentials,
        ...(options.signer !== undefined ? { signer: options.signer } : {}),
        ...(options.eventSink !== undefined ? { eventSink: options.eventSink } : {}),
      });
    },
  };
};

export {
  buildGerarNfseEnvelope,
  configureSaatriManifest,
  createSaatriHttpClient,
  createSaatriProvider,
  parseGerarNfseResponse,
  SAATRI_ABRASF_VERSION,
  SOAP_ACTION_GERAR_NFSE,
};
export type { CreateSaatriHttpOptions, GerarNfseSigner, SaatriHttpClient };
export type {
  GenerateNfseErrorResponse,
  GenerateNfseOutputDocument,
  GenerateNfseResponse,
  GenerateNfseSoapDocument,
  GenerateNfseSuccessResponse,
  ReturnMessage,
  SaatriCredentials,
  SaatriEnvironmentConfig,
  SaatriEvent,
  SaatriEventName,
  SaatriEventSink,
  SaatriSoapHeader,
} from "./config";

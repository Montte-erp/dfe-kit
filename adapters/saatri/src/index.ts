import type {
  FiscalEnvironment,
  FiscalProvider,
  FiscalProviderCapabilityMetadata,
} from "@dfe-kit/fiscal";
import { panic } from "better-result";
import { z } from "zod";
import {
  configureSaatriManifest,
  createSaatriProviderOptionsSchema,
  saatriCredentialsSchema,
  saatriEnvironmentConfigSchema,
  saatriProviderPackageConfigSchema,
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
  const parsedPackageConfig = saatriProviderPackageConfigSchema.safeParse(packageConfig);
  if (!parsedPackageConfig.success) {
    panic(`Invalid SAATRI provider package config: ${z.prettifyError(parsedPackageConfig.error)}`);
  }

  const manifest = configureSaatriManifest({
    providerId: parsedPackageConfig.data.providerId,
    providerName: parsedPackageConfig.data.providerName,
    ...(parsedPackageConfig.data.extraCapabilityMetadata !== undefined
      ? { extraCapabilityMetadata: parsedPackageConfig.data.extraCapabilityMetadata }
      : {}),
  });

  return {
    manifest,
    createProvider: (credentials, options) => {
      const parsedCredentials = saatriCredentialsSchema.safeParse(credentials);
      if (!parsedCredentials.success) {
        panic(`Invalid SAATRI credentials: ${z.prettifyError(parsedCredentials.error)}`);
      }

      const parsedOptions = createSaatriProviderOptionsSchema.safeParse(options);
      if (!parsedOptions.success) {
        panic(`Invalid SAATRI provider options: ${z.prettifyError(parsedOptions.error)}`);
      }

      const config = {
        environment: parsedOptions.data.environment,
        endpoint: parsedPackageConfig.data.endpoints[parsedOptions.data.environment],
        cityCode: parsedPackageConfig.data.cityCode,
      } satisfies SaatriEnvironmentConfig;
      const parsedConfig = saatriEnvironmentConfigSchema.safeParse(config);
      if (!parsedConfig.success) {
        panic(`Invalid SAATRI runtime config: ${z.prettifyError(parsedConfig.error)}`);
      }

      const httpOptions: CreateSaatriHttpOptions =
        parsedOptions.data.timeoutMs === undefined
          ? {}
          : { timeoutMs: parsedOptions.data.timeoutMs };
      const http = createSaatriHttpClient(httpOptions);

      return createSaatriProvider({
        manifest,
        http,
        config: parsedConfig.data,
        credentials: parsedCredentials.data,
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

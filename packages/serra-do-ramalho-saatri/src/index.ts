import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  SERRA_DO_RAMALHO_CITY_CODE,
  SERRA_DO_RAMALHO_SAATRI_PROVIDER_CONFIG,
  serraDoRamalhoSaatriManifest,
  SAATRI_SERRA_DO_RAMALHO_HOMOLOGATION_ENDPOINT,
  SAATRI_SERRA_DO_RAMALHO_PRODUCTION_ENDPOINT,
} from "./manifest";

const serraDoRamalhoSaatriPackage = configureSaatriProviderPackage(
  SERRA_DO_RAMALHO_SAATRI_PROVIDER_CONFIG,
);

export {
  SERRA_DO_RAMALHO_CITY_CODE,
  SERRA_DO_RAMALHO_SAATRI_PROVIDER_CONFIG,
  serraDoRamalhoSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_SERRA_DO_RAMALHO_HOMOLOGATION_ENDPOINT,
  SAATRI_SERRA_DO_RAMALHO_PRODUCTION_ENDPOINT,
};
export type { FiscalProvider, FiscalProviderManifest } from "@dfe-kit/fiscal";
export type {
  CreateSaatriPackageProviderOptions,
  GerarNfseSigner,
  SaatriCredentials,
  SaatriEnvironmentConfig,
  SaatriEvent,
  SaatriEventName,
  SaatriEventSink,
  SaatriProviderError,
  SaatriProviderErrorCode,
  SaatriProviderPackageConfig,
  SaatriProviderWithHttpService,
  SaatriSoapHeader,
} from "@dfe-kit/adapter-saatri";

export const createSerraDoRamalhoSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  serraDoRamalhoSaatriPackage.createProviderWithHttpService(credentials, options);

export const createSerraDoRamalhoSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => serraDoRamalhoSaatriPackage.createProvider(credentials, options);

export const createSerraDoRamalhoSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createSerraDoRamalhoSaatriProvider(credentials, options));

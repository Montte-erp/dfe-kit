import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  MORRO_DO_CHAPEU_CITY_CODE,
  MORRO_DO_CHAPEU_SAATRI_PROVIDER_CONFIG,
  morroDoChapeuSaatriManifest,
  SAATRI_MORRO_DO_CHAPEU_HOMOLOGATION_ENDPOINT,
  SAATRI_MORRO_DO_CHAPEU_PRODUCTION_ENDPOINT,
} from "./manifest";

const morroDoChapeuSaatriPackage = configureSaatriProviderPackage(
  MORRO_DO_CHAPEU_SAATRI_PROVIDER_CONFIG,
);

export {
  MORRO_DO_CHAPEU_CITY_CODE,
  MORRO_DO_CHAPEU_SAATRI_PROVIDER_CONFIG,
  morroDoChapeuSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_MORRO_DO_CHAPEU_HOMOLOGATION_ENDPOINT,
  SAATRI_MORRO_DO_CHAPEU_PRODUCTION_ENDPOINT,
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

export const createMorroDoChapeuSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  morroDoChapeuSaatriPackage.createProviderWithHttpService(credentials, options);

export const createMorroDoChapeuSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => morroDoChapeuSaatriPackage.createProvider(credentials, options);

export const createMorroDoChapeuSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createMorroDoChapeuSaatriProvider(credentials, options));

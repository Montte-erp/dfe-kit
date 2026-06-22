import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  ITABERABA_CITY_CODE,
  ITABERABA_SAATRI_PROVIDER_CONFIG,
  itaberabaSaatriManifest,
  SAATRI_ITABERABA_HOMOLOGATION_ENDPOINT,
  SAATRI_ITABERABA_PRODUCTION_ENDPOINT,
} from "./manifest";

const itaberabaSaatriPackage = configureSaatriProviderPackage(ITABERABA_SAATRI_PROVIDER_CONFIG);

export {
  ITABERABA_CITY_CODE,
  ITABERABA_SAATRI_PROVIDER_CONFIG,
  itaberabaSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_ITABERABA_HOMOLOGATION_ENDPOINT,
  SAATRI_ITABERABA_PRODUCTION_ENDPOINT,
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

export const createItaberabaSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  itaberabaSaatriPackage.createProviderWithHttpService(credentials, options);

export const createItaberabaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => itaberabaSaatriPackage.createProvider(credentials, options);

export const createItaberabaSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createItaberabaSaatriProvider(credentials, options));

import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  AMARGOSA_CITY_CODE,
  AMARGOSA_SAATRI_PROVIDER_CONFIG,
  amargosaSaatriManifest,
  SAATRI_AMARGOSA_HOMOLOGATION_ENDPOINT,
  SAATRI_AMARGOSA_PRODUCTION_ENDPOINT,
} from "./manifest";

const amargosaSaatriPackage = configureSaatriProviderPackage(AMARGOSA_SAATRI_PROVIDER_CONFIG);

export {
  AMARGOSA_CITY_CODE,
  AMARGOSA_SAATRI_PROVIDER_CONFIG,
  amargosaSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_AMARGOSA_HOMOLOGATION_ENDPOINT,
  SAATRI_AMARGOSA_PRODUCTION_ENDPOINT,
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

export const createAmargosaSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  amargosaSaatriPackage.createProviderWithHttpService(credentials, options);

export const createAmargosaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => amargosaSaatriPackage.createProvider(credentials, options);

export const createAmargosaSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createAmargosaSaatriProvider(credentials, options));

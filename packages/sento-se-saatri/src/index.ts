import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  SENTO_SE_CITY_CODE,
  SENTO_SE_SAATRI_PROVIDER_CONFIG,
  sentoSeSaatriManifest,
  SAATRI_SENTO_SE_HOMOLOGATION_ENDPOINT,
  SAATRI_SENTO_SE_PRODUCTION_ENDPOINT,
} from "./manifest";

const sentoSeSaatriPackage = configureSaatriProviderPackage(SENTO_SE_SAATRI_PROVIDER_CONFIG);

export {
  SENTO_SE_CITY_CODE,
  SENTO_SE_SAATRI_PROVIDER_CONFIG,
  sentoSeSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_SENTO_SE_HOMOLOGATION_ENDPOINT,
  SAATRI_SENTO_SE_PRODUCTION_ENDPOINT,
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

export const createSentoSeSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  sentoSeSaatriPackage.createProviderWithHttpService(credentials, options);

export const createSentoSeSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => sentoSeSaatriPackage.createProvider(credentials, options);

export const createSentoSeSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createSentoSeSaatriProvider(credentials, options));

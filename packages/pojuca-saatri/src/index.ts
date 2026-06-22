import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  POJUCA_CITY_CODE,
  POJUCA_SAATRI_PROVIDER_CONFIG,
  pojucaSaatriManifest,
  SAATRI_POJUCA_HOMOLOGATION_ENDPOINT,
  SAATRI_POJUCA_PRODUCTION_ENDPOINT,
} from "./manifest";

const pojucaSaatriPackage = configureSaatriProviderPackage(POJUCA_SAATRI_PROVIDER_CONFIG);

export {
  POJUCA_CITY_CODE,
  POJUCA_SAATRI_PROVIDER_CONFIG,
  pojucaSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_POJUCA_HOMOLOGATION_ENDPOINT,
  SAATRI_POJUCA_PRODUCTION_ENDPOINT,
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

export const createPojucaSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  pojucaSaatriPackage.createProviderWithHttpService(credentials, options);

export const createPojucaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => pojucaSaatriPackage.createProvider(credentials, options);

export const createPojucaSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createPojucaSaatriProvider(credentials, options));

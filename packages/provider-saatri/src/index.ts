import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderPackageConfig,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  createSaatriMunicipalityManifest,
  getSaatriMunicipalitiesByState,
  getSaatriMunicipalityByCityCode,
  getSaatriMunicipalityByProviderId,
  saatriMunicipalityCatalog,
  saatriMunicipalityStates,
} from "./catalog";

export {
  createSaatriMunicipalityManifest,
  getSaatriMunicipalitiesByState,
  getSaatriMunicipalityByCityCode,
  getSaatriMunicipalityByProviderId,
  SAATRI_ABRASF_VERSION,
  saatriMunicipalityCatalog,
  saatriMunicipalityStates,
};
export {
  createSaatriFetchHttpClientLayer,
  createSaatriHttpClientLayer,
  SaatriHttpClient,
} from "@dfe-kit/adapter-saatri";
export type { FiscalProvider, FiscalProviderManifest } from "@dfe-kit/fiscal";
export type {
  CreateSaatriHttpOptions,
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
export type {
  SaatriMunicipalityDescriptor,
  SaatriMunicipalityId,
  SaatriMunicipalityState,
} from "./catalog";

export const createSaatriProviderFromConfig = (
  config: SaatriProviderPackageConfig,
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => configureSaatriProviderPackage(config).createProvider(credentials, options);

export const createSaatriProviderWithHttpServiceFromConfig = (
  config: SaatriProviderPackageConfig,
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  configureSaatriProviderPackage(config).createProviderWithHttpService(credentials, options);

export const createSaatriProviderLayerFromConfig = (
  config: SaatriProviderPackageConfig,
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(
    FiscalProviderService,
    createSaatriProviderFromConfig(config, credentials, options),
  );

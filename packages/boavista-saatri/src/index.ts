import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  BOAVISTA_CITY_CODE,
  BOAVISTA_SAATRI_PROVIDER_CONFIG,
  boavistaSaatriManifest,
  SAATRI_BOAVISTA_HOMOLOGATION_ENDPOINT,
  SAATRI_BOAVISTA_PRODUCTION_ENDPOINT,
} from "./manifest";

const boavistaSaatriPackage = configureSaatriProviderPackage(BOAVISTA_SAATRI_PROVIDER_CONFIG);

export {
  BOAVISTA_CITY_CODE,
  BOAVISTA_SAATRI_PROVIDER_CONFIG,
  boavistaSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_BOAVISTA_HOMOLOGATION_ENDPOINT,
  SAATRI_BOAVISTA_PRODUCTION_ENDPOINT,
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

export const createBoavistaSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  boavistaSaatriPackage.createProviderWithHttpService(credentials, options);

export const createBoavistaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => boavistaSaatriPackage.createProvider(credentials, options);

export const createBoavistaSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createBoavistaSaatriProvider(credentials, options));

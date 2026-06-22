import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  SAO_DESIDERIO_CITY_CODE,
  SAO_DESIDERIO_SAATRI_PROVIDER_CONFIG,
  saoDesiderioSaatriManifest,
  SAATRI_SAO_DESIDERIO_HOMOLOGATION_ENDPOINT,
  SAATRI_SAO_DESIDERIO_PRODUCTION_ENDPOINT,
} from "./manifest";

const saoDesiderioSaatriPackage = configureSaatriProviderPackage(
  SAO_DESIDERIO_SAATRI_PROVIDER_CONFIG,
);

export {
  SAO_DESIDERIO_CITY_CODE,
  SAO_DESIDERIO_SAATRI_PROVIDER_CONFIG,
  saoDesiderioSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_SAO_DESIDERIO_HOMOLOGATION_ENDPOINT,
  SAATRI_SAO_DESIDERIO_PRODUCTION_ENDPOINT,
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

export const createSaoDesiderioSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  saoDesiderioSaatriPackage.createProviderWithHttpService(credentials, options);

export const createSaoDesiderioSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => saoDesiderioSaatriPackage.createProvider(credentials, options);

export const createSaoDesiderioSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createSaoDesiderioSaatriProvider(credentials, options));

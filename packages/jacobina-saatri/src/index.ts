import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
} from "@dfe-kit/adapter-saatri";
import type { FiscalProvider } from "@dfe-kit/fiscal";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  JACOBINA_SAATRI_PROVIDER_CONFIG,
  JACOBINA_CITY_CODE,
  jacobinaSaatriManifest,
  SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
  SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
} from "./manifest";

const jacobinaSaatriPackage = configureSaatriProviderPackage(JACOBINA_SAATRI_PROVIDER_CONFIG);

export {
  JACOBINA_CITY_CODE,
  jacobinaSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
  SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
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
  SaatriSoapHeader,
} from "@dfe-kit/adapter-saatri";

export const createJacobinaSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => jacobinaSaatriPackage.createProviderWithHttpService(credentials, options);

export const createJacobinaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => jacobinaSaatriPackage.createProvider(credentials, options);

import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  IPIRA_CITY_CODE,
  IPIRA_SAATRI_PROVIDER_CONFIG,
  ipiraSaatriManifest,
  SAATRI_IPIRA_HOMOLOGATION_ENDPOINT,
  SAATRI_IPIRA_PRODUCTION_ENDPOINT,
} from "./manifest";

const ipiraSaatriPackage = configureSaatriProviderPackage(IPIRA_SAATRI_PROVIDER_CONFIG);

export {
  IPIRA_CITY_CODE,
  IPIRA_SAATRI_PROVIDER_CONFIG,
  ipiraSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_IPIRA_HOMOLOGATION_ENDPOINT,
  SAATRI_IPIRA_PRODUCTION_ENDPOINT,
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

export const createIpiraSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  ipiraSaatriPackage.createProviderWithHttpService(credentials, options);

export const createIpiraSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => ipiraSaatriPackage.createProvider(credentials, options);

export const createIpiraSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(FiscalProviderService, createIpiraSaatriProvider(credentials, options));

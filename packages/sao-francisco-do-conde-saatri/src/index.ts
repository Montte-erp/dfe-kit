import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
  SaatriProviderWithHttpService,
} from "@dfe-kit/adapter-saatri";
import { FiscalProviderService, type FiscalProvider } from "@dfe-kit/fiscal";
import { Layer } from "effect";
import { configureSaatriProviderPackage, SAATRI_ABRASF_VERSION } from "@dfe-kit/adapter-saatri";
import {
  SAO_FRANCISCO_DO_CONDE_CITY_CODE,
  SAO_FRANCISCO_DO_CONDE_SAATRI_PROVIDER_CONFIG,
  saoFranciscoDoCondeSaatriManifest,
  SAATRI_SAO_FRANCISCO_DO_CONDE_HOMOLOGATION_ENDPOINT,
  SAATRI_SAO_FRANCISCO_DO_CONDE_PRODUCTION_ENDPOINT,
} from "./manifest";

const saoFranciscoDoCondeSaatriPackage = configureSaatriProviderPackage(
  SAO_FRANCISCO_DO_CONDE_SAATRI_PROVIDER_CONFIG,
);

export {
  SAO_FRANCISCO_DO_CONDE_CITY_CODE,
  SAO_FRANCISCO_DO_CONDE_SAATRI_PROVIDER_CONFIG,
  saoFranciscoDoCondeSaatriManifest,
  SAATRI_ABRASF_VERSION,
  SAATRI_SAO_FRANCISCO_DO_CONDE_HOMOLOGATION_ENDPOINT,
  SAATRI_SAO_FRANCISCO_DO_CONDE_PRODUCTION_ENDPOINT,
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

export const createSaoFranciscoDoCondeSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): SaatriProviderWithHttpService =>
  saoFranciscoDoCondeSaatriPackage.createProviderWithHttpService(credentials, options);

export const createSaoFranciscoDoCondeSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => saoFranciscoDoCondeSaatriPackage.createProvider(credentials, options);

export const createSaoFranciscoDoCondeSaatriProviderLayer = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): Layer.Layer<FiscalProvider> =>
  Layer.succeed(
    FiscalProviderService,
    createSaoFranciscoDoCondeSaatriProvider(credentials, options),
  );

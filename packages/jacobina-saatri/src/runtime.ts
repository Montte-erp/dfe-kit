import type {
  CreateSaatriPackageProviderOptions,
  SaatriCredentials,
} from "@dfe-kit/adapter-saatri";
import type { FiscalProvider } from "@dfe-kit/fiscal";
import { configureSaatriProviderPackage } from "@dfe-kit/adapter-saatri";
import { JACOBINA_SAATRI_PROVIDER_CONFIG, jacobinaSaatriManifest } from "./manifest";

const jacobinaSaatriPackage = configureSaatriProviderPackage(JACOBINA_SAATRI_PROVIDER_CONFIG);

export const createJacobinaSaatriProviderWithHttpService = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => jacobinaSaatriPackage.createProviderWithHttpService(credentials, options);

export const createJacobinaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateSaatriPackageProviderOptions,
): FiscalProvider => jacobinaSaatriPackage.createProvider(credentials, options);

export { jacobinaSaatriManifest };
export type { FiscalProvider } from "@dfe-kit/fiscal";
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

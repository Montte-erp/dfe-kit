import type { FiscalEnvironment, FiscalProvider, FiscalProviderManifest } from "@dfekit/fiscal";
import {
  configureSaatriProviderPackage,
  type GerarNfseSigner,
  type SaatriCredentials,
  type SaatriEnvironmentConfig,
  type SaatriEvent,
  type SaatriEventName,
  type SaatriEventSink,
  type SaatriSoapHeader,
} from "@dfekit/adapter-saatri";

export const SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT =
  "https://homologa-homologa-jacobina.saatri.com.br/servicos/nfse.svc";

export const SAATRI_JACOBINA_PRODUCTION_ENDPOINT =
  "https://homologa-jacobina.saatri.com.br/servicos/nfse.svc";

export const JACOBINA_CITY_CODE = "2917706";

export type JacobinaSaatriCredentials = SaatriCredentials;
export type JacobinaSaatriEnvironmentConfig = SaatriEnvironmentConfig;
export type JacobinaSaatriEvent = SaatriEvent;
export type JacobinaSaatriEventName = SaatriEventName;
export type JacobinaSaatriEventSink = SaatriEventSink;
export type JacobinaSaatriSigner = GerarNfseSigner;
export type JacobinaSaatriSoapHeader = SaatriSoapHeader;

export interface CreateJacobinaSaatriProviderOptions {
  readonly environment: FiscalEnvironment;
  readonly signer?: JacobinaSaatriSigner;
  readonly timeoutMs?: number;
  readonly eventSink?: JacobinaSaatriEventSink;
}

const configuredJacobinaSaatriPackage = configureSaatriProviderPackage({
  providerId: "jacobina-saatri",
  providerName: "SAATRI Jacobina-BA (NFS-e ABRASF 2.03)",
  cityCode: JACOBINA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
  },
});

export const jacobinaSaatriManifest: FiscalProviderManifest =
  configuredJacobinaSaatriPackage.manifest;

export const createJacobinaSaatriProvider = (
  credentials: JacobinaSaatriCredentials,
  options: CreateJacobinaSaatriProviderOptions,
): FiscalProvider => configuredJacobinaSaatriPackage.createProvider(credentials, options);

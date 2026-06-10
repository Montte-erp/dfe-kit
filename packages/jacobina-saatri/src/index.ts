import type { FiscalEnvironment, FiscalProvider, FiscalProviderManifest } from "@dfekit/fiscal";
import {
  configureSaatriProviderPackage,
  type GerarNfseSigner,
  type SaatriCredentials,
  type SaatriEventSink,
} from "@dfekit/adapter-saatri";
import {
  JACOBINA_CITY_CODE,
  SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
  SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
} from "./manifest";

export interface CreateJacobinaSaatriProviderOptions {
  readonly environment: FiscalEnvironment;
  readonly signer?: GerarNfseSigner;
  readonly timeoutMs?: number;
  readonly eventSink?: SaatriEventSink;
}

export const jacobinaSaatriPackage = configureSaatriProviderPackage({
  providerId: "jacobina-saatri",
  providerName: "SAATRI Jacobina-BA (NFS-e ABRASF 2.03)",
  cityCode: JACOBINA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
  },
});

export const jacobinaSaatriManifest: FiscalProviderManifest = jacobinaSaatriPackage.manifest;

export const createJacobinaSaatriProvider = (
  credentials: SaatriCredentials,
  options: CreateJacobinaSaatriProviderOptions,
): FiscalProvider => jacobinaSaatriPackage.createProvider(credentials, options);

export {
  JACOBINA_CITY_CODE,
  SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT,
  SAATRI_JACOBINA_PRODUCTION_ENDPOINT,
} from "./manifest";
export type {
  GerarNfseSigner,
  SaatriCredentials,
  SaatriEnvironmentConfig,
  SaatriEvent,
  SaatriEventName,
  SaatriEventSink,
  SaatriSoapHeader,
} from "@dfekit/adapter-saatri";

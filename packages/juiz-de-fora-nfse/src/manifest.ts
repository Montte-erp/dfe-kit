import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import {
  createNfseMunicipalPortalManifestByProviderId,
  getNfseMunicipalPortalByProviderId,
} from "@dfe-kit/provider-nfse/municipal-catalog";
import type {
  NfseMunicipalPortalDescriptor,
  NfseMunicipalPortalId,
} from "@dfe-kit/provider-nfse/municipal-catalog";

export type JuizDeForaNfsePortal = NfseMunicipalPortalDescriptor;

export const JUIZ_DE_FORA_NFSE_PROVIDER_ID: NfseMunicipalPortalId = "juiz-de-fora-mg-nfse";
export const JUIZ_DE_FORA_NFSE_PORTAL: JuizDeForaNfsePortal = getNfseMunicipalPortalByProviderId(
  JUIZ_DE_FORA_NFSE_PROVIDER_ID,
);

export const JUIZ_DE_FORA_CITY_CODE: string = JUIZ_DE_FORA_NFSE_PORTAL.cityCode;
export const JUIZ_DE_FORA_NFSE_HOMOLOGATION_ENDPOINT: string =
  JUIZ_DE_FORA_NFSE_PORTAL.endpoints.homologation;
export const JUIZ_DE_FORA_NFSE_PRODUCTION_ENDPOINT: string =
  JUIZ_DE_FORA_NFSE_PORTAL.endpoints.production;
export const JUIZ_DE_FORA_NFSE_HOMOLOGATION_WSDL: string =
  JUIZ_DE_FORA_NFSE_PORTAL.wsdl.homologation;
export const JUIZ_DE_FORA_NFSE_PRODUCTION_WSDL: string = JUIZ_DE_FORA_NFSE_PORTAL.wsdl.production;

export const juizDeForaNfseManifest: FiscalProviderManifest =
  createNfseMunicipalPortalManifestByProviderId(JUIZ_DE_FORA_NFSE_PROVIDER_ID);

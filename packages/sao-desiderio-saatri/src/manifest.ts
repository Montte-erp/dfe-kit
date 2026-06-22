import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const SAO_DESIDERIO_CITY_CODE: string = "2928901";
export const SAATRI_SAO_DESIDERIO_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-saodesiderio.saatri.com.br/servicos/nfse.svc";
export const SAATRI_SAO_DESIDERIO_PRODUCTION_ENDPOINT: string =
  "https://saodesiderio.saatri.com.br/servicos/nfse.svc";

export const SAO_DESIDERIO_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "sao-desiderio-saatri",
  providerName: "SAATRI São Desidério-BA (NFS-e ABRASF 2.03)",
  cityCode: SAO_DESIDERIO_CITY_CODE,
  endpoints: {
    homologation: SAATRI_SAO_DESIDERIO_HOMOLOGATION_ENDPOINT,
    production: SAATRI_SAO_DESIDERIO_PRODUCTION_ENDPOINT,
  },
};

export const saoDesiderioSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  SAO_DESIDERIO_SAATRI_PROVIDER_CONFIG,
);

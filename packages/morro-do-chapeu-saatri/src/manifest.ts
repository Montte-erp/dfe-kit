import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const MORRO_DO_CHAPEU_CITY_CODE: string = "2921708";
export const SAATRI_MORRO_DO_CHAPEU_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-morrodochapeu.saatri.com.br/servicos/nfse.svc";
export const SAATRI_MORRO_DO_CHAPEU_PRODUCTION_ENDPOINT: string =
  "https://morrodochapeu.saatri.com.br/servicos/nfse.svc";

export const MORRO_DO_CHAPEU_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "morro-do-chapeu-saatri",
  providerName: "SAATRI Morro do Chapéu-BA (NFS-e ABRASF 2.03)",
  cityCode: MORRO_DO_CHAPEU_CITY_CODE,
  endpoints: {
    homologation: SAATRI_MORRO_DO_CHAPEU_HOMOLOGATION_ENDPOINT,
    production: SAATRI_MORRO_DO_CHAPEU_PRODUCTION_ENDPOINT,
  },
};

export const morroDoChapeuSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  MORRO_DO_CHAPEU_SAATRI_PROVIDER_CONFIG,
);

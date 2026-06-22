import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const SERRA_DO_RAMALHO_CITY_CODE: string = "2930154";
export const SAATRI_SERRA_DO_RAMALHO_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-serradoramalho.saatri.com.br/servicos/nfse.svc";
export const SAATRI_SERRA_DO_RAMALHO_PRODUCTION_ENDPOINT: string =
  "https://serradoramalho.saatri.com.br/servicos/nfse.svc";

export const SERRA_DO_RAMALHO_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "serra-do-ramalho-saatri",
  providerName: "SAATRI Serra do Ramalho-BA (NFS-e ABRASF 2.03)",
  cityCode: SERRA_DO_RAMALHO_CITY_CODE,
  endpoints: {
    homologation: SAATRI_SERRA_DO_RAMALHO_HOMOLOGATION_ENDPOINT,
    production: SAATRI_SERRA_DO_RAMALHO_PRODUCTION_ENDPOINT,
  },
};

export const serraDoRamalhoSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  SERRA_DO_RAMALHO_SAATRI_PROVIDER_CONFIG,
);

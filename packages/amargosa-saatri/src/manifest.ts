import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const AMARGOSA_CITY_CODE: string = "2901007";
export const SAATRI_AMARGOSA_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-amargosa.saatri.com.br/servicos/nfse.svc";
export const SAATRI_AMARGOSA_PRODUCTION_ENDPOINT: string =
  "https://amargosa.saatri.com.br/servicos/nfse.svc";

export const AMARGOSA_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "amargosa-saatri",
  providerName: "SAATRI Amargosa-BA (NFS-e ABRASF 2.03)",
  cityCode: AMARGOSA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_AMARGOSA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_AMARGOSA_PRODUCTION_ENDPOINT,
  },
};

export const amargosaSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  AMARGOSA_SAATRI_PROVIDER_CONFIG,
);

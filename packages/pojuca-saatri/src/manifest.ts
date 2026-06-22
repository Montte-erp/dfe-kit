import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const POJUCA_CITY_CODE: string = "2925204";
export const SAATRI_POJUCA_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-pojuca.saatri.com.br/servicos/nfse.svc";
export const SAATRI_POJUCA_PRODUCTION_ENDPOINT: string =
  "https://pojuca.saatri.com.br/servicos/nfse.svc";

export const POJUCA_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "pojuca-saatri",
  providerName: "SAATRI Pojuca-BA (NFS-e ABRASF 2.03)",
  cityCode: POJUCA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_POJUCA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_POJUCA_PRODUCTION_ENDPOINT,
  },
};

export const pojucaSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  POJUCA_SAATRI_PROVIDER_CONFIG,
);

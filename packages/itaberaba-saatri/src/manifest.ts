import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const ITABERABA_CITY_CODE: string = "2914703";
export const SAATRI_ITABERABA_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-itaberaba.saatri.com.br/servicos/nfse.svc";
export const SAATRI_ITABERABA_PRODUCTION_ENDPOINT: string =
  "https://itaberaba.saatri.com.br/servicos/nfse.svc";

export const ITABERABA_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "itaberaba-saatri",
  providerName: "SAATRI Itaberaba-BA (NFS-e ABRASF 2.03)",
  cityCode: ITABERABA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_ITABERABA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_ITABERABA_PRODUCTION_ENDPOINT,
  },
};

export const itaberabaSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  ITABERABA_SAATRI_PROVIDER_CONFIG,
);

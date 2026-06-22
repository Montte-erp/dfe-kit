import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const SENTO_SE_CITY_CODE: string = "2930204";
export const SAATRI_SENTO_SE_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-sentose.saatri.com.br/servicos/nfse.svc";
export const SAATRI_SENTO_SE_PRODUCTION_ENDPOINT: string =
  "https://sentose.saatri.com.br/servicos/nfse.svc";

export const SENTO_SE_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "sento-se-saatri",
  providerName: "SAATRI Sento Sé-BA (NFS-e ABRASF 2.03)",
  cityCode: SENTO_SE_CITY_CODE,
  endpoints: {
    homologation: SAATRI_SENTO_SE_HOMOLOGATION_ENDPOINT,
    production: SAATRI_SENTO_SE_PRODUCTION_ENDPOINT,
  },
};

export const sentoSeSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  SENTO_SE_SAATRI_PROVIDER_CONFIG,
);

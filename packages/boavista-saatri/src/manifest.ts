import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const BOAVISTA_CITY_CODE: string = "1400100";
export const SAATRI_BOAVISTA_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-boavista.saatri.com.br/servicos/nfse.svc";
export const SAATRI_BOAVISTA_PRODUCTION_ENDPOINT: string =
  "https://boavista.saatri.com.br/servicos/nfse.svc";

export const BOAVISTA_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "boavista-saatri",
  providerName: "SAATRI Boa Vista-RR (NFS-e ABRASF 2.03)",
  cityCode: BOAVISTA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_BOAVISTA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_BOAVISTA_PRODUCTION_ENDPOINT,
  },
};

export const boavistaSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  BOAVISTA_SAATRI_PROVIDER_CONFIG,
);

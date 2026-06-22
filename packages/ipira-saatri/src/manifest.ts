import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const IPIRA_CITY_CODE: string = "2914000";
export const SAATRI_IPIRA_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-ipira.saatri.com.br/servicos/nfse.svc";
export const SAATRI_IPIRA_PRODUCTION_ENDPOINT: string =
  "https://ipira.saatri.com.br/servicos/nfse.svc";

export const IPIRA_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "ipira-saatri",
  providerName: "SAATRI Ipirá-BA (NFS-e ABRASF 2.03)",
  cityCode: IPIRA_CITY_CODE,
  endpoints: {
    homologation: SAATRI_IPIRA_HOMOLOGATION_ENDPOINT,
    production: SAATRI_IPIRA_PRODUCTION_ENDPOINT,
  },
};

export const ipiraSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  IPIRA_SAATRI_PROVIDER_CONFIG,
);

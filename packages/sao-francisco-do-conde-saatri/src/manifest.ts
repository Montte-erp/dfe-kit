import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import type { SaatriProviderPackageConfig } from "@dfe-kit/adapter-saatri";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri";

export const SAO_FRANCISCO_DO_CONDE_CITY_CODE: string = "2929206";
export const SAATRI_SAO_FRANCISCO_DO_CONDE_HOMOLOGATION_ENDPOINT: string =
  "https://homologa-sfconde.saatri.com.br/servicos/nfse.svc";
export const SAATRI_SAO_FRANCISCO_DO_CONDE_PRODUCTION_ENDPOINT: string =
  "https://sfconde.saatri.com.br/servicos/nfse.svc";

export const SAO_FRANCISCO_DO_CONDE_SAATRI_PROVIDER_CONFIG: SaatriProviderPackageConfig = {
  providerId: "sao-francisco-do-conde-saatri",
  providerName: "SAATRI São Francisco do Conde-BA (NFS-e ABRASF 2.03)",
  cityCode: SAO_FRANCISCO_DO_CONDE_CITY_CODE,
  endpoints: {
    homologation: SAATRI_SAO_FRANCISCO_DO_CONDE_HOMOLOGATION_ENDPOINT,
    production: SAATRI_SAO_FRANCISCO_DO_CONDE_PRODUCTION_ENDPOINT,
  },
};

export const saoFranciscoDoCondeSaatriManifest: FiscalProviderManifest = configureSaatriManifest(
  SAO_FRANCISCO_DO_CONDE_SAATRI_PROVIDER_CONFIG,
);

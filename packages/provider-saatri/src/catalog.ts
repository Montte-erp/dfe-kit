import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import {
  saatriProviderPackageConfigSchema,
  type SaatriProviderPackageConfig,
} from "@dfe-kit/adapter-saatri/manifest";
import { configureSaatriManifest } from "@dfe-kit/adapter-saatri/manifest";
import { Schema } from "effect";

export type SaatriMunicipalityState = "BA" | "RR";
export const saatriMunicipalityStateSchema: Schema.Decoder<SaatriMunicipalityState> =
  Schema.Literals(["BA", "RR"]);

export type SaatriMunicipalityId =
  | "boavista-saatri"
  | "itaberaba-saatri"
  | "ipira-saatri"
  | "sao-francisco-do-conde-saatri"
  | "pojuca-saatri"
  | "sao-desiderio-saatri"
  | "amargosa-saatri"
  | "sento-se-saatri"
  | "serra-do-ramalho-saatri"
  | "morro-do-chapeu-saatri";
export const saatriMunicipalityIdSchema: Schema.Decoder<SaatriMunicipalityId> = Schema.Literals([
  "boavista-saatri",
  "itaberaba-saatri",
  "ipira-saatri",
  "sao-francisco-do-conde-saatri",
  "pojuca-saatri",
  "sao-desiderio-saatri",
  "amargosa-saatri",
  "sento-se-saatri",
  "serra-do-ramalho-saatri",
  "morro-do-chapeu-saatri",
]);

export type SaatriMunicipalityDescriptor = {
  readonly config: SaatriProviderPackageConfig;
  readonly state: SaatriMunicipalityState;
  readonly cityName: string;
};
export const saatriMunicipalityDescriptorSchema: Schema.Decoder<SaatriMunicipalityDescriptor> =
  Schema.Struct({
    config: saatriProviderPackageConfigSchema,
    state: saatriMunicipalityStateSchema,
    cityName: Schema.NonEmptyString,
  });

export const saatriMunicipalityStates: readonly SaatriMunicipalityState[] = ["RR", "BA"];

export const saatriMunicipalityCatalog: readonly SaatriMunicipalityDescriptor[] = [
  {
    cityName: "Boa Vista",
    state: "RR",
    config: {
      providerId: "boavista-saatri",
      providerName: "SAATRI Boa Vista-RR (NFS-e ABRASF 2.03)",
      cityCode: "1400100",
      endpoints: {
        homologation: "https://homologa-boavista.saatri.com.br/servicos/nfse.svc",
        production: "https://boavista.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Itaberaba",
    state: "BA",
    config: {
      providerId: "itaberaba-saatri",
      providerName: "SAATRI Itaberaba-BA (NFS-e ABRASF 2.03)",
      cityCode: "2914703",
      endpoints: {
        homologation: "https://homologa-itaberaba.saatri.com.br/servicos/nfse.svc",
        production: "https://itaberaba.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Ipirá",
    state: "BA",
    config: {
      providerId: "ipira-saatri",
      providerName: "SAATRI Ipirá-BA (NFS-e ABRASF 2.03)",
      cityCode: "2914000",
      endpoints: {
        homologation: "https://homologa-ipira.saatri.com.br/servicos/nfse.svc",
        production: "https://ipira.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "São Francisco do Conde",
    state: "BA",
    config: {
      providerId: "sao-francisco-do-conde-saatri",
      providerName: "SAATRI São Francisco do Conde-BA (NFS-e ABRASF 2.03)",
      cityCode: "2929206",
      endpoints: {
        homologation: "https://homologa-sfconde.saatri.com.br/servicos/nfse.svc",
        production: "https://sfconde.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Pojuca",
    state: "BA",
    config: {
      providerId: "pojuca-saatri",
      providerName: "SAATRI Pojuca-BA (NFS-e ABRASF 2.03)",
      cityCode: "2925204",
      endpoints: {
        homologation: "https://homologa-pojuca.saatri.com.br/servicos/nfse.svc",
        production: "https://pojuca.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "São Desidério",
    state: "BA",
    config: {
      providerId: "sao-desiderio-saatri",
      providerName: "SAATRI São Desidério-BA (NFS-e ABRASF 2.03)",
      cityCode: "2928901",
      endpoints: {
        homologation: "https://homologa-saodesiderio.saatri.com.br/servicos/nfse.svc",
        production: "https://saodesiderio.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Amargosa",
    state: "BA",
    config: {
      providerId: "amargosa-saatri",
      providerName: "SAATRI Amargosa-BA (NFS-e ABRASF 2.03)",
      cityCode: "2901007",
      endpoints: {
        homologation: "https://homologa-amargosa.saatri.com.br/servicos/nfse.svc",
        production: "https://amargosa.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Sento Sé",
    state: "BA",
    config: {
      providerId: "sento-se-saatri",
      providerName: "SAATRI Sento Sé-BA (NFS-e ABRASF 2.03)",
      cityCode: "2930204",
      endpoints: {
        homologation: "https://homologa-sentose.saatri.com.br/servicos/nfse.svc",
        production: "https://sentose.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Serra do Ramalho",
    state: "BA",
    config: {
      providerId: "serra-do-ramalho-saatri",
      providerName: "SAATRI Serra do Ramalho-BA (NFS-e ABRASF 2.03)",
      cityCode: "2930154",
      endpoints: {
        homologation: "https://homologa-serradoramalho.saatri.com.br/servicos/nfse.svc",
        production: "https://serradoramalho.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
  {
    cityName: "Morro do Chapéu",
    state: "BA",
    config: {
      providerId: "morro-do-chapeu-saatri",
      providerName: "SAATRI Morro do Chapéu-BA (NFS-e ABRASF 2.03)",
      cityCode: "2921708",
      endpoints: {
        homologation: "https://homologa-morrodochapeu.saatri.com.br/servicos/nfse.svc",
        production: "https://morrodochapeu.saatri.com.br/servicos/nfse.svc",
      },
    },
  },
];

export const getSaatriMunicipalityByProviderId = (
  providerId: string,
): SaatriMunicipalityDescriptor | undefined =>
  saatriMunicipalityCatalog.find((municipality) => municipality.config.providerId === providerId);

export const getSaatriMunicipalityByCityCode = (
  cityCode: string,
): SaatriMunicipalityDescriptor | undefined =>
  saatriMunicipalityCatalog.find((municipality) => municipality.config.cityCode === cityCode);

export const getSaatriMunicipalitiesByState = (
  state: SaatriMunicipalityState,
): readonly SaatriMunicipalityDescriptor[] =>
  saatriMunicipalityCatalog.filter((municipality) => municipality.state === state);

export const createSaatriMunicipalityManifest = (
  config: SaatriProviderPackageConfig,
): FiscalProviderManifest => configureSaatriManifest(config);

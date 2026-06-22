import type { FiscalProviderManifest } from "@dfe-kit/fiscal";
import {
  FiscalDocumentKindValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
} from "@dfe-kit/fiscal";

type JacobinaSaatriIdentity = {
  readonly providerId: string;
  readonly providerName: string;
  readonly cityCode: string;
};

type JacobinaSaatriEndpoints = {
  readonly homologation: string;
  readonly production: string;
};

type JacobinaSaatriProviderConfig = {
  readonly providerId: string;
  readonly providerName: string;
  readonly cityCode: string;
  readonly endpoints: JacobinaSaatriEndpoints;
};

const JacobinaSaatriIdentityValue: JacobinaSaatriIdentity = {
  providerId: "jacobina-saatri",
  providerName: "SAATRI Jacobina-BA (NFS-e ABRASF 2.03)",
  cityCode: "2917508",
} satisfies Record<string, string>;

const JacobinaSaatriEndpointValue: JacobinaSaatriEndpoints = {
  homologation: "https://homologa-jacobina.saatri.com.br/servicos/nfse.svc",
  production: "https://jacobina.saatri.com.br/servicos/nfse.svc",
} satisfies Record<string, string>;

export const SAATRI_JACOBINA_HOMOLOGATION_ENDPOINT: string =
  JacobinaSaatriEndpointValue.homologation;
export const SAATRI_JACOBINA_PRODUCTION_ENDPOINT: string = JacobinaSaatriEndpointValue.production;
export const JACOBINA_CITY_CODE: string = JacobinaSaatriIdentityValue.cityCode;

export const JACOBINA_SAATRI_PROVIDER_CONFIG: JacobinaSaatriProviderConfig = {
  providerId: JacobinaSaatriIdentityValue.providerId,
  providerName: JacobinaSaatriIdentityValue.providerName,
  cityCode: JacobinaSaatriIdentityValue.cityCode,
  endpoints: JacobinaSaatriEndpointValue,
};

export const jacobinaSaatriManifest: FiscalProviderManifest = {
  id: JacobinaSaatriIdentityValue.providerId,
  name: JacobinaSaatriIdentityValue.providerName,
  documentKinds: [FiscalDocumentKindValue.nfse],
  environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
  capabilities: [FiscalProviderCapabilityValue.issueNfse],
  capabilityMetadata: [
    {
      capability: FiscalProviderCapabilityValue.issueNfse,
      status: FiscalProviderCapabilityStatusValue.supported,
      environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
      reason:
        "Implementado via operação SAATRI GerarNfse ABRASF 2.03; respostas 2026 podem ficar pendentes por compartilhamento com ambiente nacional.",
      requiresSigner: false,
      requiresCertificateOutsideDFeKit: false,
    },
    {
      capability: FiscalProviderCapabilityValue.generateNfse,
      status: FiscalProviderCapabilityStatusValue.supported,
      environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
      reason: "Equivalente operacional a issue_nfse neste adapter SAATRI.",
      requiresSigner: false,
      requiresCertificateOutsideDFeKit: false,
    },
    {
      capability: FiscalProviderCapabilityValue.queryNfseByRps,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
      reason:
        "Manual SAATRI lista ConsultaNfsePorRps, mas o fluxo ainda não tem implementação e prova automatizada.",
    },
    {
      capability: FiscalProviderCapabilityValue.submitRpsBatch,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista recepção de lote RPS, ainda não homologado no DFeKit.",
    },
    {
      capability: FiscalProviderCapabilityValue.submitRpsBatchSync,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista envio de lote síncrono, ainda não homologado no DFeKit.",
    },
    {
      capability: FiscalProviderCapabilityValue.queryRpsBatch,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista consulta de lote RPS, ainda não homologada no DFeKit.",
    },
    {
      capability: FiscalProviderCapabilityValue.queryIssuedNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista consulta de NFS-e prestadas, ainda não homologada no DFeKit.",
    },
    {
      capability: FiscalProviderCapabilityValue.queryReceivedNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista consulta de NFS-e tomadas, ainda não homologada no DFeKit.",
    },
    {
      capability: FiscalProviderCapabilityValue.queryNfseRange,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista consulta por faixa, ainda não homologada no DFeKit.",
    },
    {
      capability: FiscalProviderCapabilityValue.cancelNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista cancelamento, ainda não homologado no DFeKit.",
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.replaceNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason: "Manual SAATRI lista substituição, ainda não homologada no DFeKit.",
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.issueNfe,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "SAATRI é provider municipal de NFS-e, não NF-e modelo 55.",
    },
    {
      capability: FiscalProviderCapabilityValue.issueNfce,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "SAATRI é provider municipal de NFS-e, não NFC-e modelo 65.",
    },
  ],
};

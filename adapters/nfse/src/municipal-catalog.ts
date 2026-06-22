import {
  FiscalDocumentKindValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
} from "@dfe-kit/fiscal";
import type {
  BrazilianStateCode,
  FiscalEnvironment,
  FiscalProviderCapabilityMetadata,
  FiscalProviderManifest,
} from "@dfe-kit/fiscal";

export type NfseMunicipalPortalState = Extract<BrazilianStateCode, "MG">;
export type NfseMunicipalPortalFamily = "pjf-abrasf-2.02";

export type NfseMunicipalPortalEndpoints = {
  readonly homologation: string;
  readonly production: string;
};

export type NfseMunicipalPortalDescriptor = {
  readonly providerId: string;
  readonly providerName: string;
  readonly cityCode: string;
  readonly cityName: string;
  readonly state: NfseMunicipalPortalState;
  readonly family: NfseMunicipalPortalFamily;
  readonly layoutVersion: string;
  readonly portalUrl: string;
  readonly endpoints: NfseMunicipalPortalEndpoints;
  readonly wsdl: NfseMunicipalPortalEndpoints;
  readonly maxXmlBytes: number;
  readonly maxRpsPerBatch: number;
  readonly requiresCertificateOutsideDFeKit: true;
  readonly requiresSigner: true;
  readonly sourceUrls: readonly string[];
  readonly capabilityMetadata?: readonly FiscalProviderCapabilityMetadata[] | undefined;
};

export type NfseMunicipalPortalId = "juiz-de-fora-mg-nfse";

const commonMunicipalCapabilityMetadata: readonly FiscalProviderCapabilityMetadata[] = [
  {
    capability: FiscalProviderCapabilityValue.issueNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
    reason:
      "Portal municipal ABRASF mapeado; emissão exige XML assinado, certificado ICP-Brasil/mTLS fora do DFeKit e homologação por contribuinte antes de marcar suporte como provado.",
    requiresSigner: true,
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.generateNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "Equivalente operacional a issue_nfse no WebService municipal, ainda sem homologação por contribuinte no DFeKit.",
    requiresSigner: true,
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.submitRpsBatch,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista envio assíncrono de lote RPS, mas o DFeKit ainda não homologou o fluxo.",
    requiresSigner: true,
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.submitRpsBatchSync,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista envio síncrono de lote RPS, mas o DFeKit ainda não homologou o fluxo.",
    requiresSigner: true,
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.queryRpsBatch,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista consulta de lote RPS, mas o DFeKit ainda não homologou o fluxo.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.queryNfseByRps,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista consulta de NFS-e por RPS, mas o DFeKit ainda não homologou o fluxo.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.queryIssuedNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista consulta de NFS-e prestadas, mas o DFeKit ainda não homologou o fluxo.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.queryReceivedNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista consulta de NFS-e tomadas/intermediadas, mas o DFeKit ainda não homologou o fluxo.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.queryNfseRange,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista consulta de NFS-e por faixa, mas o DFeKit ainda não homologou o fluxo.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.cancelNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista cancelamento de NFS-e, mas o DFeKit ainda não homologou o fluxo.",
    requiresSigner: true,
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.replaceNfse,
    status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
    reason:
      "WebService municipal lista substituição de NFS-e, mas o DFeKit ainda não homologou o fluxo.",
    requiresSigner: true,
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: FiscalProviderCapabilityValue.issueNfe,
    status: FiscalProviderCapabilityStatusValue.unsupported,
    reason: "Portal municipal NFS-e não emite NF-e modelo 55.",
  },
  {
    capability: FiscalProviderCapabilityValue.issueNfce,
    status: FiscalProviderCapabilityStatusValue.unsupported,
    reason: "Portal municipal NFS-e não emite NFC-e modelo 65.",
  },
];

export const nfseMunicipalPortalStates: readonly NfseMunicipalPortalState[] = ["MG"];

export const nfseMunicipalPortalByProviderId: Record<
  NfseMunicipalPortalId,
  NfseMunicipalPortalDescriptor
> = {
  "juiz-de-fora-mg-nfse": {
    providerId: "juiz-de-fora-mg-nfse",
    providerName: "NFS-e Juiz de Fora-MG (ABRASF 2.02)",
    cityCode: "3136702",
    cityName: "Juiz de Fora",
    state: "MG",
    family: "pjf-abrasf-2.02",
    layoutVersion: "ABRASF 2.02",
    portalUrl: "https://nfse.pjf.mg.gov.br/",
    endpoints: {
      homologation: "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx",
      production: "https://nfse.pjf.mg.gov.br:4431/WebService.asmx",
    },
    wsdl: {
      homologation: "https://nfse.homologacao.pjf.mg.gov.br:4432/WebService.asmx?WSDL",
      production: "https://nfse.pjf.mg.gov.br:4431/WebService.asmx?WSDL",
    },
    maxXmlBytes: 512 * 1024,
    maxRpsPerBatch: 250,
    requiresCertificateOutsideDFeKit: true,
    requiresSigner: true,
    sourceUrls: [
      "https://nfse.pjf.mg.gov.br/Home/WebService",
      "https://nfse.pjf.mg.gov.br/ComunicadoNfseNacional.html",
    ],
    capabilityMetadata: commonMunicipalCapabilityMetadata,
  },
};

export const nfseMunicipalPortalCatalog: readonly NfseMunicipalPortalDescriptor[] = Object.values(
  nfseMunicipalPortalByProviderId,
);

export const getNfseMunicipalPortalByCityCode = (
  cityCode: string,
): NfseMunicipalPortalDescriptor | undefined =>
  nfseMunicipalPortalCatalog.find((portal) => portal.cityCode === cityCode);

export const getNfseMunicipalPortalByProviderId = (
  providerId: NfseMunicipalPortalId,
): NfseMunicipalPortalDescriptor => nfseMunicipalPortalByProviderId[providerId];

export const getNfseMunicipalPortalsByState = (
  state: NfseMunicipalPortalState,
): readonly NfseMunicipalPortalDescriptor[] =>
  nfseMunicipalPortalCatalog.filter((portal) => portal.state === state);

export const municipalNfseEndpointForEnvironment = (
  portal: NfseMunicipalPortalDescriptor,
  environment: FiscalEnvironment,
): string => portal.endpoints[environment];

export const createNfseMunicipalPortalManifest = (
  portal: NfseMunicipalPortalDescriptor,
): FiscalProviderManifest => ({
  id: portal.providerId,
  name: portal.providerName,
  documentKinds: [FiscalDocumentKindValue.nfse],
  environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
  capabilities: [FiscalProviderCapabilityValue.issueNfse],
  capabilityMetadata: portal.capabilityMetadata,
});

export const createNfseMunicipalPortalManifestByProviderId = (
  providerId: NfseMunicipalPortalId,
): FiscalProviderManifest =>
  createNfseMunicipalPortalManifest(nfseMunicipalPortalByProviderId[providerId]);

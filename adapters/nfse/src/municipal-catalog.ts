import {
  FiscalDocumentKindValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
} from "@dfe-kit/fiscal";
import type {
  FiscalEnvironment,
  FiscalProviderCapabilityMetadata,
  FiscalProviderManifest,
} from "@dfe-kit/fiscal";
import { fiscalProviderCapabilityMetadataSchema } from "@dfe-kit/fiscal/schemas";
import { Schema } from "effect";

const endpointUrl = Schema.String.check(Schema.isPattern(/^https:\/\/.+/));

export type NfseMunicipalPortalState = "MG";
export const nfseMunicipalPortalStateSchema: Schema.Decoder<NfseMunicipalPortalState> =
  Schema.Literal("MG");

export type NfseMunicipalPortalFamily = "pjf-abrasf-2.02";
export const nfseMunicipalPortalFamilySchema: Schema.Decoder<NfseMunicipalPortalFamily> =
  Schema.Literal("pjf-abrasf-2.02");

export type NfseMunicipalPortalEndpoints = {
  readonly homologation: string;
  readonly production: string;
};
export const nfseMunicipalPortalEndpointsSchema: Schema.Decoder<NfseMunicipalPortalEndpoints> =
  Schema.Struct({
    homologation: endpointUrl,
    production: endpointUrl,
  });

export type NfseMunicipalPortalId = "juiz-de-fora-mg-nfse";
export const nfseMunicipalPortalIdSchema: Schema.Decoder<NfseMunicipalPortalId> =
  Schema.Literal("juiz-de-fora-mg-nfse");

export type NfseMunicipalPortalDescriptor = {
  readonly providerId: NfseMunicipalPortalId;
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
  readonly sourceUrls: ReadonlyArray<string>;
  readonly capabilityMetadata?: ReadonlyArray<FiscalProviderCapabilityMetadata> | undefined;
};
export const nfseMunicipalPortalDescriptorSchema: Schema.Decoder<NfseMunicipalPortalDescriptor> =
  Schema.Struct({
    providerId: nfseMunicipalPortalIdSchema,
    providerName: Schema.NonEmptyString,
    cityCode: Schema.String.check(Schema.isPattern(/^\d{7}$/)),
    cityName: Schema.NonEmptyString,
    state: nfseMunicipalPortalStateSchema,
    family: nfseMunicipalPortalFamilySchema,
    layoutVersion: Schema.NonEmptyString,
    portalUrl: endpointUrl,
    endpoints: nfseMunicipalPortalEndpointsSchema,
    wsdl: nfseMunicipalPortalEndpointsSchema,
    maxXmlBytes: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
    maxRpsPerBatch: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
    requiresCertificateOutsideDFeKit: Schema.Literal(true),
    requiresSigner: Schema.Literal(true),
    sourceUrls: Schema.Array(endpointUrl),
    capabilityMetadata: Schema.optional(Schema.Array(fiscalProviderCapabilityMetadataSchema)),
  });

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

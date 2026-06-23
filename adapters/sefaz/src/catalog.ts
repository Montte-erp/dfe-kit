import {
  FiscalDocumentKindValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
} from "@dfe-kit/fiscal";
import type { FiscalProviderCapabilityMetadata, FiscalProviderManifest } from "@dfe-kit/fiscal";
import { brazilianStateCodeSchema } from "@dfe-kit/fiscal/schemas";
import { Schema } from "effect";

export type SefazStateCode = (typeof brazilianStateCodeSchema)["Type"];
export const sefazStateCodeSchema: Schema.Codec<SefazStateCode, unknown> = brazilianStateCodeSchema;

export type SefazStateDocumentKind = "nfe" | "nfce";
export const sefazStateDocumentKindSchema: Schema.Codec<SefazStateDocumentKind, unknown> =
  Schema.Literals(["nfe", "nfce"]);

export type SefazStatePortalStatus = "unverified_in_homologation";
export const sefazStatePortalStatusSchema: Schema.Codec<SefazStatePortalStatus, unknown> =
  Schema.Literal("unverified_in_homologation");

export type SefazStatePortalDescriptor = {
  readonly state: SefazStateCode;
  readonly stateName: string;
  readonly portalName: string;
  readonly documentKinds: ReadonlyArray<SefazStateDocumentKind>;
  readonly integrationStatus: SefazStatePortalStatus;
  readonly requiresEndpointConfiguration: true;
  readonly requiresSigner: true;
  readonly requiresCertificateOutsideDFeKit: true;
};
export const sefazStatePortalDescriptorSchema: Schema.Codec<SefazStatePortalDescriptor, unknown> =
  Schema.Struct({
    state: sefazStateCodeSchema,
    stateName: Schema.NonEmptyString,
    portalName: Schema.NonEmptyString,
    documentKinds: Schema.Array(sefazStateDocumentKindSchema),
    integrationStatus: sefazStatePortalStatusSchema,
    requiresEndpointConfiguration: Schema.Literal(true),
    requiresSigner: Schema.Literal(true),
    requiresCertificateOutsideDFeKit: Schema.Literal(true),
  });

const stateDocumentKinds: readonly SefazStateDocumentKind[] = [
  FiscalDocumentKindValue.nfe,
  FiscalDocumentKindValue.nfce,
];
const stateEnvironments: FiscalProviderManifest["environments"] = [
  FiscalEnvironmentValue.homologation,
  FiscalEnvironmentValue.production,
];
const unverifiedStatus: SefazStatePortalStatus =
  FiscalProviderCapabilityStatusValue.unverifiedInHomologation;

const createStatePortal = (
  state: SefazStateCode,
  stateName: string,
): SefazStatePortalDescriptor => ({
  state,
  stateName,
  portalName: `SEFAZ ${stateName}`,
  documentKinds: stateDocumentKinds,
  integrationStatus: unverifiedStatus,
  requiresEndpointConfiguration: true,
  requiresSigner: true,
  requiresCertificateOutsideDFeKit: true,
});

const createStateCapabilityMetadata = (
  portal: SefazStatePortalDescriptor,
): readonly FiscalProviderCapabilityMetadata[] => [
  {
    capability: FiscalProviderCapabilityValue.issueNfe,
    status: portal.integrationStatus,
    environments: stateEnvironments,
    reason: `Package estadual delega a submissão de XML/envelope NF-e assinado para endpoint da UF ${portal.state} configurado pela aplicação; montagem fiscal completa, assinatura e mTLS ficam fora do DFeKit até homologação em ${portal.stateName}.`,
    requiresSigner: portal.requiresSigner,
    requiresCertificateOutsideDFeKit: portal.requiresCertificateOutsideDFeKit,
  },
  {
    capability: FiscalProviderCapabilityValue.issueNfce,
    status: portal.integrationStatus,
    environments: stateEnvironments,
    reason: `Package estadual delega a submissão de XML/envelope NFC-e assinado para endpoint da UF ${portal.state} configurado pela aplicação; contingência, QR Code CSC e autorização por UF ainda não foram homologados em ${portal.stateName}.`,
    requiresSigner: portal.requiresSigner,
    requiresCertificateOutsideDFeKit: portal.requiresCertificateOutsideDFeKit,
  },
  {
    capability: FiscalProviderCapabilityValue.issueNfse,
    status: FiscalProviderCapabilityStatusValue.unsupported,
    reason: `${portal.portalName} modelo 55/65 não emite NFS-e municipal ou nacional.`,
  },
];

export const sefazStatePortalByState: Record<SefazStateCode, SefazStatePortalDescriptor> = {
  AC: createStatePortal("AC", "Acre"),
  AL: createStatePortal("AL", "Alagoas"),
  AP: createStatePortal("AP", "Amapá"),
  AM: createStatePortal("AM", "Amazonas"),
  BA: createStatePortal("BA", "Bahia"),
  CE: createStatePortal("CE", "Ceará"),
  DF: createStatePortal("DF", "Distrito Federal"),
  ES: createStatePortal("ES", "Espírito Santo"),
  GO: createStatePortal("GO", "Goiás"),
  MA: createStatePortal("MA", "Maranhão"),
  MT: createStatePortal("MT", "Mato Grosso"),
  MS: createStatePortal("MS", "Mato Grosso do Sul"),
  MG: createStatePortal("MG", "Minas Gerais"),
  PA: createStatePortal("PA", "Pará"),
  PB: createStatePortal("PB", "Paraíba"),
  PR: createStatePortal("PR", "Paraná"),
  PE: createStatePortal("PE", "Pernambuco"),
  PI: createStatePortal("PI", "Piauí"),
  RJ: createStatePortal("RJ", "Rio de Janeiro"),
  RN: createStatePortal("RN", "Rio Grande do Norte"),
  RS: createStatePortal("RS", "Rio Grande do Sul"),
  RO: createStatePortal("RO", "Rondônia"),
  RR: createStatePortal("RR", "Roraima"),
  SC: createStatePortal("SC", "Santa Catarina"),
  SP: createStatePortal("SP", "São Paulo"),
  SE: createStatePortal("SE", "Sergipe"),
  TO: createStatePortal("TO", "Tocantins"),
};

export const sefazStatePortalCatalog: readonly SefazStatePortalDescriptor[] =
  Object.values(sefazStatePortalByState);

export const createSefazStateManifest = (state: SefazStateCode): FiscalProviderManifest => {
  const portal = sefazStatePortalByState[state];

  return {
    id: `sefaz-${state.toLowerCase()}`,
    name: `${portal.portalName} NF-e/NFC-e (modelo 55/65)`,
    documentKinds: portal.documentKinds,
    environments: stateEnvironments,
    capabilities: [FiscalProviderCapabilityValue.issueNfe, FiscalProviderCapabilityValue.issueNfce],
    capabilityMetadata: createStateCapabilityMetadata(portal),
  };
};

export const getSefazStatePortalByState = (state: SefazStateCode): SefazStatePortalDescriptor =>
  sefazStatePortalByState[state];

export const getSefazStatePortalsByDocumentKind = (
  documentKind: SefazStateDocumentKind,
): readonly SefazStatePortalDescriptor[] =>
  sefazStatePortalCatalog.filter((portal) => portal.documentKinds.includes(documentKind));

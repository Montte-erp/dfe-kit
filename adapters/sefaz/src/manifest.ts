import {
  FiscalDocumentKindValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
} from "@dfe-kit/fiscal";
import type { FiscalProviderManifest } from "@dfe-kit/fiscal";

export const sefazManifest: FiscalProviderManifest = {
  id: "adapter-sefaz",
  name: "SEFAZ NF-e/NFC-e (modelo 55/65)",
  documentKinds: [FiscalDocumentKindValue.nfe, FiscalDocumentKindValue.nfce],
  environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
  capabilities: [FiscalProviderCapabilityValue.issueNfe, FiscalProviderCapabilityValue.issueNfce],
  capabilityMetadata: [
    {
      capability: FiscalProviderCapabilityValue.issueNfe,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
      reason:
        "Adapter SEFAZ submete XML/envelope SEFAZ já assinado para endpoint configurado pela aplicação; montagem fiscal completa, assinatura e mTLS ficam fora do DFeKit até fixtures e homologação por UF.",
      requiresSigner: true,
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.issueNfce,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
      reason:
        "Adapter SEFAZ submete XML/envelope SEFAZ já assinado para endpoint configurado pela aplicação; contingência, QR Code CSC e autorização por UF ainda não foram homologados no DFeKit.",
      requiresSigner: true,
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.issueNfse,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "SEFAZ modelo 55/65 não emite NFS-e municipal ou nacional.",
    },
  ],
};

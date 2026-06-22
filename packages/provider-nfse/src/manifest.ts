import {
  FiscalDocumentKindValue,
  FiscalEnvironmentValue,
  FiscalProviderCapabilityStatusValue,
  FiscalProviderCapabilityValue,
} from "@dfe-kit/fiscal";
import type { FiscalProviderManifest } from "@dfe-kit/fiscal";

export const NFSE_NACIONAL_HOMOLOGATION_ENDPOINT: string =
  "https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional";
export const NFSE_NACIONAL_PRODUCTION_ENDPOINT: string = "https://sefin.nfse.gov.br/SefinNacional";

export const nfseNacionalManifest: FiscalProviderManifest = {
  id: "provider-nfse",
  name: "NFS-e Nacional (Sefin Nacional)",
  documentKinds: [FiscalDocumentKindValue.nfse],
  environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
  capabilities: [FiscalProviderCapabilityValue.issueNfse],
  capabilityMetadata: [
    {
      capability: FiscalProviderCapabilityValue.issueNfse,
      status: FiscalProviderCapabilityStatusValue.supported,
      environments: [FiscalEnvironmentValue.homologation, FiscalEnvironmentValue.production],
      reason:
        "Implementado como submissão síncrona de DPS XML assinada para POST /nfse da Sefin Nacional; construção e assinatura da DPS e mTLS ficam fora do DFeKit.",
      requiresSigner: true,
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.queryNfseByRps,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason:
        "A API nacional consulta NFS-e por chave de acesso ou DPS id; o contrato fiscal atual ainda não modela consulta por DPS.",
    },
    {
      capability: FiscalProviderCapabilityValue.cancelNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason:
        "Manual nacional lista registro de eventos em POST /nfse/{chaveAcesso}/eventos, mas cancelamento ainda não está implementado e homologado no DFeKit.",
      requiresSigner: true,
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.replaceNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason:
        "Substituição nacional depende de DPS com chave da NFS-e substituída; ainda sem fixture e homologação no DFeKit.",
      requiresSigner: true,
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.submitRpsBatch,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "Emissão nacional por contribuinte usa DPS via POST /nfse, não lote RPS ABRASF.",
    },
    {
      capability: FiscalProviderCapabilityValue.submitRpsBatchSync,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason:
        "Emissão nacional por contribuinte usa DPS via POST /nfse, não lote RPS síncrono ABRASF.",
    },
    {
      capability: FiscalProviderCapabilityValue.queryRpsBatch,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "Emissão nacional por contribuinte não usa consulta de lote RPS ABRASF.",
    },
    {
      capability: FiscalProviderCapabilityValue.queryIssuedNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason:
        "Manual do ADN lista distribuição de documentos por NSU para contribuintes, ainda não implementada no DFeKit.",
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.queryReceivedNfse,
      status: FiscalProviderCapabilityStatusValue.unverifiedInHomologation,
      reason:
        "Manual do ADN lista distribuição de documentos por NSU para contribuintes, ainda não implementada no DFeKit.",
      requiresCertificateOutsideDFeKit: true,
    },
    {
      capability: FiscalProviderCapabilityValue.queryNfseRange,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "A API nacional não expõe consulta ABRASF por faixa neste contrato de provider.",
    },
    {
      capability: FiscalProviderCapabilityValue.issueNfe,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "NFS-e Nacional emite NFS-e, não NF-e modelo 55.",
    },
    {
      capability: FiscalProviderCapabilityValue.issueNfce,
      status: FiscalProviderCapabilityStatusValue.unsupported,
      reason: "NFS-e Nacional emite NFS-e, não NFC-e modelo 65.",
    },
  ],
};

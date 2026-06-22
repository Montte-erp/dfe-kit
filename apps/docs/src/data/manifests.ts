// Dados de capability REAIS, espelhados verbatim do manifesto publicado.
// Fonte da verdade: packages/jacobina-saatri/src/manifest.ts (jacobinaSaatriManifest)
// e adapters/saatri/src/manifest.ts (configureSaatriManifest — template compartilhado
// por todos os 11 municípios SAATRI: mesma distribuição 2 supported · 9 unverified · 2 unsupported).
//
// Este módulo é DESACOPLADO do workspace (o app docs builda sozinho), mas o conteúdo
// é extraído do código que ships — status e motivos não são inventados, e as contagens
// abaixo são COMPUTADAS do array, nunca escritas à mão.

export type CapabilityStatus = "supported" | "unverified_in_homologation" | "unsupported";
export type FiscalEnvironment = "homologation" | "production";

export interface CapabilityRow {
  readonly capability: string;
  readonly status: CapabilityStatus;
  /** Ambientes onde a capability é exercível (supported) ou mapeada. */
  readonly environments: readonly FiscalEnvironment[];
  readonly reason: string;
  /** Cancelamento/substituição exigem certificado fora do DFeKit. */
  readonly requiresCertificateOutsideDFeKit?: boolean;
}

/** Vocabulário tri-state da marca — uma só gramática de três verdades fiscais. */
export const STATUS_META: Record<
  CapabilityStatus,
  { readonly label: string; readonly badge: "success" | "warning" | "secondary"; readonly dot: string; readonly tooltip: string }
> = {
  supported: {
    label: "supported",
    badge: "success",
    dot: "bg-success",
    tooltip: "Fluxo real provado em homologação.",
  },
  unverified_in_homologation: {
    label: "unverified",
    badge: "warning",
    dot: "bg-warning",
    tooltip: "Mapeado no manifesto, ainda não provado em homologação.",
  },
  unsupported: {
    label: "unsupported",
    badge: "secondary",
    dot: "bg-muted-foreground",
    tooltip: "Fora do escopo deste provider.",
  },
};

// jacobinaSaatriManifest.capabilityMetadata — verbatim de packages/jacobina-saatri/src/manifest.ts
export const JACOBINA_CAPABILITIES: readonly CapabilityRow[] = [
  {
    capability: "issue_nfse",
    status: "supported",
    environments: ["homologation", "production"],
    reason:
      "Implementado via operação SAATRI GerarNfse ABRASF 2.03; respostas 2026 podem ficar pendentes por compartilhamento com ambiente nacional.",
  },
  {
    capability: "generate_nfse",
    status: "supported",
    environments: ["homologation", "production"],
    reason: "Equivalente operacional a issue_nfse neste adapter SAATRI.",
  },
  {
    capability: "query_nfse_by_rps",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason:
      "Manual SAATRI lista ConsultaNfsePorRps, mas o fluxo ainda não tem implementação e prova automatizada.",
  },
  {
    capability: "submit_rps_batch",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista recepção de lote RPS, ainda não homologado no DFeKit.",
  },
  {
    capability: "submit_rps_batch_sync",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista envio de lote síncrono, ainda não homologado no DFeKit.",
  },
  {
    capability: "query_rps_batch",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista consulta de lote RPS, ainda não homologada no DFeKit.",
  },
  {
    capability: "query_issued_nfse",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista consulta de NFS-e prestadas, ainda não homologada no DFeKit.",
  },
  {
    capability: "query_received_nfse",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista consulta de NFS-e tomadas, ainda não homologada no DFeKit.",
  },
  {
    capability: "query_nfse_range",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista consulta por faixa, ainda não homologada no DFeKit.",
  },
  {
    capability: "cancel_nfse",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista cancelamento, ainda não homologado no DFeKit.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: "replace_nfse",
    status: "unverified_in_homologation",
    environments: ["homologation"],
    reason: "Manual SAATRI lista substituição, ainda não homologada no DFeKit.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: "issue_nfe",
    status: "unsupported",
    environments: [],
    reason: "SAATRI é provider municipal de NFS-e, não NF-e modelo 55.",
  },
  {
    capability: "issue_nfce",
    status: "unsupported",
    environments: [],
    reason: "SAATRI é provider municipal de NFS-e, não NFC-e modelo 65.",
  },
];

export interface CapabilityCounts {
  readonly supported: number;
  readonly unverified_in_homologation: number;
  readonly unsupported: number;
  readonly total: number;
}

/** Contagem COMPUTADA do array — nunca hardcoded. */
export function countCapabilities(rows: readonly CapabilityRow[]): CapabilityCounts {
  const base = { supported: 0, unverified_in_homologation: 0, unsupported: 0 };
  for (const row of rows) base[row.status] += 1;
  return { ...base, total: rows.length };
}

export const JACOBINA_COUNTS: CapabilityCounts = countCapabilities(JACOBINA_CAPABILITIES);

/** Resumo "2/13 supported" derivado em build. */
export function supportedSummary(rows: readonly CapabilityRow[]): string {
  const c = countCapabilities(rows);
  return `${c.supported}/${c.total} supported`;
}

// Catálogo de pacotes REAIS do monorepo (verificado em packages/*).
// 11 municípios SAATRI (template compartilhado adapters/saatri → mesma distribuição
// 2 supported · 9 unverified · 2 unsupported) + Juiz de Fora-MG (ABRASF 2.02, metadata-first)
// + 27 packages SEFAZ por UF (metadata-first, runtime homologado em aberto).

import { supportedSummary, JACOBINA_CAPABILITIES } from "./manifests";

export interface CorePackage {
  readonly name: string;
  readonly summary: string;
}

export interface MunicipalityPackage {
  readonly name: string; // @dfe-kit/<slug>
  readonly city: string; // nome exibido
  readonly uf: string;
  readonly standard: string; // ABRASF 2.03 / 2.02
  /** Resumo de prova de capability quando verificado (SAATRI = 2/13). */
  readonly supportSummary: string;
  /** metadata-first => ainda sem prova de runtime no DFeKit. */
  readonly metadataFirst?: boolean;
}

export interface StatePackage {
  readonly name: string; // @dfe-kit/sefaz-<uf>
  readonly uf: string;
  readonly state: string;
}

export const CORE_PACKAGES: readonly CorePackage[] = [
  { name: "@dfe-kit/fiscal", summary: "Contrato fiscal, schemas Effect e o manifesto de provider — a fonte da verdade das capabilities." },
  { name: "@dfe-kit/xml", summary: "Primitivas XML pequenas para escape, encoding e payloads fiscais." },
];

// Distribuição verificada do template SAATRI (adapters/saatri), computada do manifesto real.
const SAATRI_SUMMARY = supportedSummary(JACOBINA_CAPABILITIES); // "2/13 supported"

export const MUNICIPALITY_PACKAGES: readonly MunicipalityPackage[] = [
  { name: "@dfe-kit/jacobina-saatri", city: "Jacobina", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/amargosa-saatri", city: "Amargosa", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/boavista-saatri", city: "Boa Vista", uf: "RR", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/ipira-saatri", city: "Ipirá", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/itaberaba-saatri", city: "Itaberaba", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/morro-do-chapeu-saatri", city: "Morro do Chapéu", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/pojuca-saatri", city: "Pojuca", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/sao-desiderio-saatri", city: "São Desidério", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/sao-francisco-do-conde-saatri", city: "São Francisco do Conde", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/sento-se-saatri", city: "Sento Sé", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/serra-do-ramalho-saatri", city: "Serra do Ramalho", uf: "BA", standard: "ABRASF 2.03", supportSummary: SAATRI_SUMMARY },
  { name: "@dfe-kit/juiz-de-fora-nfse", city: "Juiz de Fora", uf: "MG", standard: "ABRASF 2.02", supportSummary: "metadata-first", metadataFirst: true },
];

export const STATE_PACKAGES: readonly StatePackage[] = [
  { name: "@dfe-kit/sefaz-ac", uf: "AC", state: "Acre" },
  { name: "@dfe-kit/sefaz-al", uf: "AL", state: "Alagoas" },
  { name: "@dfe-kit/sefaz-am", uf: "AM", state: "Amazonas" },
  { name: "@dfe-kit/sefaz-ap", uf: "AP", state: "Amapá" },
  { name: "@dfe-kit/sefaz-ba", uf: "BA", state: "Bahia" },
  { name: "@dfe-kit/sefaz-ce", uf: "CE", state: "Ceará" },
  { name: "@dfe-kit/sefaz-df", uf: "DF", state: "Distrito Federal" },
  { name: "@dfe-kit/sefaz-es", uf: "ES", state: "Espírito Santo" },
  { name: "@dfe-kit/sefaz-go", uf: "GO", state: "Goiás" },
  { name: "@dfe-kit/sefaz-ma", uf: "MA", state: "Maranhão" },
  { name: "@dfe-kit/sefaz-mg", uf: "MG", state: "Minas Gerais" },
  { name: "@dfe-kit/sefaz-ms", uf: "MS", state: "Mato Grosso do Sul" },
  { name: "@dfe-kit/sefaz-mt", uf: "MT", state: "Mato Grosso" },
  { name: "@dfe-kit/sefaz-pa", uf: "PA", state: "Pará" },
  { name: "@dfe-kit/sefaz-pb", uf: "PB", state: "Paraíba" },
  { name: "@dfe-kit/sefaz-pe", uf: "PE", state: "Pernambuco" },
  { name: "@dfe-kit/sefaz-pi", uf: "PI", state: "Piauí" },
  { name: "@dfe-kit/sefaz-pr", uf: "PR", state: "Paraná" },
  { name: "@dfe-kit/sefaz-rj", uf: "RJ", state: "Rio de Janeiro" },
  { name: "@dfe-kit/sefaz-rn", uf: "RN", state: "Rio Grande do Norte" },
  { name: "@dfe-kit/sefaz-ro", uf: "RO", state: "Rondônia" },
  { name: "@dfe-kit/sefaz-rr", uf: "RR", state: "Roraima" },
  { name: "@dfe-kit/sefaz-rs", uf: "RS", state: "Rio Grande do Sul" },
  { name: "@dfe-kit/sefaz-sc", uf: "SC", state: "Santa Catarina" },
  { name: "@dfe-kit/sefaz-se", uf: "SE", state: "Sergipe" },
  { name: "@dfe-kit/sefaz-sp", uf: "SP", state: "São Paulo" },
  { name: "@dfe-kit/sefaz-to", uf: "TO", state: "Tocantins" },
];

export interface BuiltOnItem {
  readonly label: string;
  readonly tooltip: string;
}

// Faixa "Construído sobre" — padrões e tecnologias REAIS no lugar onde sites falsificam logos.
export const BUILT_ON: readonly BuiltOnItem[] = [
  { label: "Effect v4", tooltip: "Toda operação fiscal retorna Effect.Effect com entrada, saída e falhas tipadas." },
  { label: "TypeScript", tooltip: "Contratos e schemas totalmente tipados, do manifesto à resposta." },
  { label: "ABRASF 2.03", tooltip: "Padrão nacional de NFS-e usado pelo adapter SAATRI." },
  { label: "NFS-e Nacional", tooltip: "Caminho nacional mantido em adapter privado, sem fachada pública agregadora." },
  { label: "SEFAZ · 55/65", tooltip: "NF-e (modelo 55) e NFC-e (modelo 65) — escopo endereçável por UF." },
  { label: "ICP-Brasil (na borda)", tooltip: "Assinatura e certificado vivem fora do kit, injetados como hook na sua aplicação." },
  { label: "Apache-2.0", tooltip: "Open-source, licença permissiva." },
];

// Contagens honestas (computadas das listas reais).
export const CATALOG_STATS = {
  municipalities: MUNICIPALITY_PACKAGES.length, // 12
  states: STATE_PACKAGES.length, // 27
  saatri: MUNICIPALITY_PACKAGES.filter((m) => m.standard === "ABRASF 2.03").length, // 11
} as const;

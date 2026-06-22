export const site = {
  name: "DFeKit",
  title: "DFeKit – documentos fiscais eletrônicos para TypeScript",
  description:
    "Infraestrutura Effect-native para NFS-e municipal, NFS-e Nacional, NF-e e NFC-e por município e UF. Cada capability é auditável; homologação primeiro.",
  url: "https://dfe-kit.dev",
  github: "https://github.com/Montte-erp/dfe-kit",
  install: {
    bun: "bun add @dfe-kit/jacobina-saatri effect",
    npm: "npm i @dfe-kit/jacobina-saatri effect",
    pnpm: "pnpm add @dfe-kit/jacobina-saatri effect",
  },
};

export const landingNavigation = [
  { text: "Documentação", href: "/docs" },
  { text: "Pacotes", href: "/#packages" },
  { text: "Capabilities", href: "/#capabilities" },
];

export const docsNavigation = [
  {
    title: "Comece aqui",
    links: [
      { text: "Introdução", href: "/docs", icon: "book" },
      { text: "Instalação", href: "/docs/installation", icon: "download" },
      { text: "Primeiro uso", href: "/docs/quickstart", icon: "rocket" },
    ],
  },
  {
    title: "Conceitos",
    links: [
      { text: "Arquitetura", href: "/docs/architecture", icon: "boxes" },
      { text: "Providers", href: "/docs/providers", icon: "plug" },
      { text: "Capabilities", href: "/docs/capabilities", icon: "list-checks" },
      { text: "Execução Effect", href: "/docs/effect", icon: "zap" },
    ],
  },
  {
    title: "Documentos fiscais",
    links: [
      { text: "NFS-e", href: "/docs/nfse", icon: "receipt" },
      { text: "Prefeituras", href: "/docs/municipalities", icon: "building" },
      { text: "NF-e e NFC-e", href: "/docs/sefaz", icon: "landmark" },
      { text: "Estados", href: "/docs/states", icon: "map" },
    ],
  },
];

export interface SearchItem {
  text: string;
  href: string;
  group: string;
  // rótulo de status opcional (tri-state ou metadata-first) p/ itens de pacote
  status?: "supported" | "metadata-first";
  badge?: string;
}

// índice plano usado pelo command palette ⌘K — docs + pacotes
export const searchIndex: SearchItem[] = [
  ...docsNavigation.flatMap((group) =>
    group.links.map((link) => ({ text: link.text, href: link.href, group: group.title })),
  ),
  { text: "@dfe-kit/jacobina-saatri", href: "/docs/municipalities", group: "Pacotes", status: "supported", badge: "issue_nfse supported" },
  { text: "@dfe-kit/juiz-de-fora-nfse", href: "/docs/municipalities", group: "Pacotes", status: "metadata-first", badge: "metadata-first" },
  { text: "@dfe-kit/sefaz-<uf>", href: "/docs/states", group: "Pacotes", status: "metadata-first", badge: "metadata-first" },
  { text: "@dfe-kit/fiscal", href: "/docs/architecture", group: "Pacotes", badge: "core" },
];

import { statSync } from "node:fs";
import type { RequiredSpanCall } from "./model";

export const checkedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

export const skippedSegments = new Set(["dist", "node_modules", "outputs", "docs", "__tests__"]);
export const skippedSuffixes = new Set([".d.ts", ".tsbuildinfo", "README.md"]);
export const roots = ["core", "packages", "adapters"].filter((path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
});

export const requiredEffectSpanFiles = new Map<string, readonly RequiredSpanCall[]>([
  [
    "adapters/saatri/src/provider.ts",
    [
      { name: "dfe.saatri.issue", expression: "SaatriSpanNameValue.issue" },
      { name: "dfe.saatri.envelope.build", expression: "SaatriSpanNameValue.envelopeBuild" },
      { name: "dfe.saatri.response.parse", expression: "SaatriSpanNameValue.responseParse" },
    ],
  ],
  [
    "adapters/saatri/src/http.ts",
    [{ name: "dfe.saatri.http.post", expression: "SaatriSpanNameValue.httpPost" }],
  ],
  [
    "adapters/saatri/src/parse.ts",
    [{ name: "dfe.saatri.xml.parse", expression: "SaatriSpanNameValue.xmlParse" }],
  ],
]);

export const allowedEffectProvideSites = new Map<string, readonly string[]>([
  ["adapters/saatri/src/index.ts", ["createSaatriFetchHttpClientLayer(options)"]],
]);

export const contractSuffixes: readonly string[] = [
  "Config",
  "Options",
  "Credentials",
  "Event",
  "Header",
  "Response",
  "Document",
  "Input",
  "Data",
];
export const exportContractDeclarationPattern = new RegExp(
  `^\\s*export\\s+(?:interface|type)\\s+([A-Za-z_$][\\w$]*(?:${contractSuffixes.join("|")}))\\b`,
);
export const adapterOrPackagePathPrefixes: readonly string[] = ["adapters/", "packages/"];
export const fiscalCorePrefix = "core/fiscal/";

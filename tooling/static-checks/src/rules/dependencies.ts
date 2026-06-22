import type { Check } from "../model";

const hasLegacyDependency = (line: string): boolean =>
  /\b(?:import(?:\s+(?:type\s+)?)?(?:[^;]*\bfrom\s+)?["'](?:better-result|evlog|zod|ky)["']|import\(\s*["'](?:better-result|evlog|zod|ky)["']\s*\)|require\(\s*["'](?:better-result|evlog|zod|ky)["']\s*\))/.test(
    line,
  );

const hasMandatoryOtelDependency = (line: string): boolean =>
  /"@(?:effect\/opentelemetry|opentelemetry\/[^"/]+)"\s*:/.test(line);

const publishedProviderPackagePattern =
  /@dfe-kit\/(?:provider-(?:nfse|saatri|sefaz)|sefaz-[a-z]{2}|(?!adapter-)[a-z0-9-]+-(?:saatri|nfse))(?=$|[/"'])/;

const hasWorkspaceImportOrRequire = (line: string): boolean =>
  /\bfrom\s+["']@dfe-kit\/|\bimport\(\s*["']@dfe-kit\/|\brequire\(\s*["']@dfe-kit\//.test(line);

const hasWorkspacePackageDependency = (line: string): boolean =>
  /^\s*["@']@dfe-kit\/[^"']+["']\s*:/.test(line);

export const hasPublishedProviderLayerDependency = (line: string, path: string): boolean => {
  if (!/^(?:core|adapters|packages)\//.test(path)) {
    return false;
  }

  if (!publishedProviderPackagePattern.test(line)) {
    return false;
  }

  return (
    hasWorkspaceImportOrRequire(line) ||
    hasWorkspacePackageDependency(line) ||
    path.endsWith("/bunup.config.ts")
  );
};

export const dependencyChecks: readonly Check[] = [
  {
    message:
      "Troque dependências legadas por alternativas modernas: better-result, evlog, zod, ky.",
    test: ({ line }) => hasLegacyDependency(line),
    ignoreImportLine: false,
  },
  {
    message:
      "OpenTelemetry deve ser opcional no runtime consumidor; não adicione @effect/opentelemetry ou @opentelemetry/* em dependencies de adapters/packages.",
    test: ({ line, path }) =>
      /^(?:adapters|packages)\/[^/]+\/package\.json$/.test(path) &&
      hasMandatoryOtelDependency(line),
    ignoreImportLine: false,
  },
  {
    message:
      "Packages publicados não devem depender de outros packages publicados; mova código compartilhado para adapters/* ou core/* e inline via bunup.",
    test: ({ line, path }) => hasPublishedProviderLayerDependency(line, path),
    ignoreImportLine: false,
  },
];

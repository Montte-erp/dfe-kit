import type { Check } from "../model";

const hasLegacyDependency = (line: string): boolean =>
  /\b(?:import(?:\s+(?:type\s+)?)?(?:[^;]*\bfrom\s+)?["'](?:better-result|evlog|zod|ky)["']|import\(\s*["'](?:better-result|evlog|zod|ky)["']\s*\)|require\(\s*["'](?:better-result|evlog|zod|ky)["']\s*\))/.test(
    line,
  );

const hasMandatoryOtelDependency = (line: string): boolean =>
  /"@(?:effect\/opentelemetry|opentelemetry\/[^"/]+)"\s*:/.test(line);

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
];

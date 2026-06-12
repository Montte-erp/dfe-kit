import type { Check } from "../model";

const hasSecretStringInInternalConfig = (line: string): boolean =>
  /\b(password|secret|token|certificate|privateKey)\b/i.test(line) &&
  /\b(?:Schema\.String|Schema\.NonEmptyString|nonEmptyString|:\s*string)\b/.test(line) &&
  !/\bRedacted\b/.test(line);

export const configChecks: readonly Check[] = [
  {
    message: "Segredos em config interna devem usar Redacted, não string simples.",
    test: ({ line }) => hasSecretStringInInternalConfig(line),
    ignoreImportLine: false,
  },
];

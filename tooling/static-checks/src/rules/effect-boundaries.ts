import type { Check, CheckContext } from "../model";
import { allowedEffectProvideSites } from "../config";

const hasEscapedEffectBoundary = (line: string): boolean =>
  /\bEffect\.(runSync|runPromise|runFork)\b/.test(line) ||
  /\bSchema\.decodeUnknownSync\b/.test(line);

const hasLegacyEffectServiceApi = (line: string): boolean =>
  /\b(?:Context\.(?:Reference|Tag|GenericTag)|Effect\.(?:Tag|Service))\s*[<(]/.test(line);

const hasLocalEffectBoundary = (context: CheckContext): boolean => {
  const current = context.rawLine;
  const previous = context.rawLines[context.lineNumber - 2] ?? "";
  const boundaryPattern = /\/\/\s*effect-boundary:\s*\S[\s\S]*\[allow-provide\]/;
  return boundaryPattern.test(current) || boundaryPattern.test(previous);
};

const hasEffectProvideCall = (context: CheckContext): boolean =>
  /\bprovide(?:Service|Layer)?\b/.test(context.line) &&
  /\bEffect\s*\.\s*provide(?:Service|Layer)?\s*\(/.test(context.window);

const hasAllowedEffectProvideSite = (context: CheckContext): boolean => {
  const allowedArguments = allowedEffectProvideSites.get(context.path);
  if (allowedArguments === undefined) {
    return false;
  }
  return allowedArguments.some((argument) => context.window.includes(argument));
};

const hasHiddenEffectProvide = (context: CheckContext): boolean =>
  hasEffectProvideCall(context) &&
  !/\.(?:test|spec)\.tsx?$/.test(context.path) &&
  (!hasLocalEffectBoundary(context) || !hasAllowedEffectProvideSite(context));

export const effectBoundaryChecks: readonly Check[] = [
  {
    message:
      "Não fuja do canal de erro de Effect com runSync/runPromise/runFork nem Schema.decodeUnknownSync.",
    test: ({ line }) => hasEscapedEffectBoundary(line),
    ignoreImportLine: false,
  },
  {
    message: "Use Context.Service/Layer v4; não use Context.Reference/Context.Tag/Effect.Tag.",
    test: ({ line }) => hasLegacyEffectServiceApi(line),
    ignoreImportLine: true,
  },
  {
    message:
      "Não aplique Effect.provide dentro de biblioteca sem boundary explícito `// effect-boundary`.",
    test: hasHiddenEffectProvide,
    ignoreImportLine: true,
  },
];

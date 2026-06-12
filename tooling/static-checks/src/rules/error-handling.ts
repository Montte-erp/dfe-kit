import type { Check } from "../model";
import { isTaggedErrorName } from "./shared";

const hasHttpClientErrorInspector = (line: string): boolean =>
  /\b(?:const|function)\s+(?:isRecord|get[A-Za-z_$][\w$]*Error[A-Za-z_$\w$]*|create[A-Za-z_$][\w$]*Error[A-Za-z_$\w$]*)\b/.test(
    line,
  );

const hasRuntimeErrorHelpers = (line: string): boolean => {
  const statementKeywords = /\b(try|catch|finally)\b\s*[{(]/g;
  for (const match of line.matchAll(statementKeywords)) {
    const start = match.index ?? 0;
    const before = start > 0 ? line[start - 1] : "";
    if (before === "." || before === "?") {
      continue;
    }

    return true;
  }

  const errorMatch =
    /(?:instanceof|throw\s+new)\s+([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?(?:\s*<[^>]+>)?)/g;
  for (const match of line.matchAll(errorMatch)) {
    const candidate = match[1]?.trim() ?? "";
    if (!candidate) {
      continue;
    }

    if (!isTaggedErrorName(candidate)) {
      return true;
    }
  }

  if (/\b(isHTTPError|isTimeoutError|HTTPError|TimeoutError)\b(?!\s*:)/.test(line)) {
    return true;
  }

  return false;
};

const hasErrorFactoryOrClassName = (line: string, _path: string, source: string): boolean => {
  if (/TaggedErrorClass/.test(line) || /Schema\.TaggedError/.test(line)) {
    return false;
  }

  const declarationMatch =
    /\b(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)\b/.exec(line);
  if (!declarationMatch) {
    return false;
  }

  const declaration = line.slice(
    declarationMatch.index,
    declarationMatch.index + declarationMatch[0].length,
  );
  const name = declarationMatch[1] ?? "";
  if (/(?:Failure|Fault|Error)$/.test(name)) {
    if (/\bclass\b/.test(declaration) && /\bextends\s+[A-Za-z_$][\w$]*ErrorBase\b/.test(line)) {
      return false;
    }

    if (/\bclass\b/.test(declaration) && /TaggedError/i.test(source)) {
      const start = source.indexOf(line);
      if (start !== -1) {
        const tail = source.slice(start, start + line.length + 200);
        if (/\bTaggedErrorClass\b/.test(tail) || /\bSchema\.TaggedError\b/.test(tail)) {
          return false;
        }
      }
    }

    return true;
  }

  return /\b(?:create|make|parse|build|normalize|sanitize|coerce|assert|wrap|unwrap|map)[A-Za-z_$]*(?:Error|Failure|Fault)\b/.test(
    name,
  );
};

const hasStringErrorOnlyMapping = (line: string): boolean =>
  /\b(?:reason|cause|message)\s*:\s*String\s*\(\s*(?:error|reason|cause|unknown)\s*\)/.test(line);

const hasDirectEventSinkCallback = (line: string): boolean =>
  /\beventSink\?\.\s*\(|\beventSink\s*\(/.test(line) &&
  !/\b(?:readonly\s+eventSink|eventSink\s*:|type\s+.*EventSink|eventSink\s*===)/.test(line);

export const errorHandlingChecks: readonly Check[] = [
  {
    message:
      "Mapeie erro de HttpClient direto com Match.value(error.reason); não crie isRecord/get*Error*/create*Error* para inspecionar objeto.",
    test: ({ line }) => hasHttpClientErrorInspector(line),
    ignoreImportLine: true,
  },
  {
    message:
      "Use erro por tagged Effect no fluxo de decisão; não trate erro via runtime Error (instanceof/throw) nem try/catch/finally.",
    test: ({ line }) => hasRuntimeErrorHelpers(line),
    ignoreImportLine: false,
  },
  {
    message:
      "Use helper de erro TaggedErrorClass/Schema.TaggedErrorClass no ponto de decisão. Não crie auxiliares nomeados *Failure/*Fault/*Error fora disso.",
    test: ({ line, path, source }) => hasErrorFactoryOrClassName(line, path, source),
    ignoreImportLine: true,
  },
  {
    message: "Não use String(error/reason/cause) como único dado preservado de erro.",
    test: ({ line }) => hasStringErrorOnlyMapping(line),
    ignoreImportLine: false,
  },
  {
    message: "Não chame eventSink diretamente; use sink Effect-native seguro.",
    test: ({ line }) => hasDirectEventSinkCallback(line),
    ignoreImportLine: false,
  },
];

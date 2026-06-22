import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { requiredEffectSpanFiles, roots } from "./config";
import { walk } from "./filesystem";
import type { CheckContext } from "./model";
import { normalizeLine } from "./normalize";
import { hasRequiredSpanCall } from "./observability";
import { checks } from "./rule-set";

const isImportLine = (line: string): boolean => /^\s*import\b/.test(line);

const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

const reexportStatementPattern =
  /export\s+(?:type\s+)?\{[\s\S]*?\}\s+from\s+["'][^"']+["'];?|export\s+\*\s+from\s+["'][^"']+["'];?/g;

const isBarrelOnlySource = (source: string): boolean => {
  const withoutComments = stripComments(source).trim();
  if (withoutComments.length === 0) {
    return false;
  }

  return withoutComments.replace(reexportStatementPattern, "").trim().length === 0;
};

export const runDeclarativeChecks = (): boolean => {
  let failed = false;
  for (const file of roots.flatMap((root) => [...walk(root)])) {
    const source = readFileSync(file, "utf8");
    if (isBarrelOnlySource(source)) {
      console.error(`${relative(process.cwd(), file)}:1: barrel-only file`);
      console.error(
        "Declarative error handling check failed. Barrel-only files são bloat; mova o conteúdo real para o entrypoint ou remova o subpath.",
      );
      failed = true;
      continue;
    }
    const requiredSpans = requiredEffectSpanFiles.get(file);
    if (requiredSpans !== undefined) {
      for (const span of requiredSpans) {
        if (!hasRequiredSpanCall(source, span)) {
          console.error(`${relative(process.cwd(), file)}:1: ${span.name}`);
          console.error(
            "Declarative error handling check failed. Fluxos SAATRI devem manter chamadas Effect.withSpan reais via catálogo de observabilidade.",
          );
          failed = true;
        }
      }
    }
    const rawLines = source.split(/\r?\n/);
    const lines = rawLines.map(normalizeLine);

    for (const [index, rawLine] of rawLines.entries()) {
      const line = lines[index] ?? "";
      const normalizedLine = line.trim();
      const isImport = isImportLine(normalizedLine);

      if (!normalizedLine || normalizedLine.startsWith("*") || normalizedLine.startsWith("//")) {
        continue;
      }

      const context: CheckContext = {
        line: normalizedLine,
        rawLine,
        window: lines
          .slice(index, index + 3)
          .join(" ")
          .trim(),
        path: file,
        source,
        lineNumber: index + 1,
        lines,
        rawLines,
      };

      for (const check of checks) {
        if (check.ignoreImportLine && isImport) {
          continue;
        }

        if (!check.test(context)) {
          continue;
        }

        console.error(`${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`);
        console.error(`Declarative error handling check failed. ${check.message}`);
        failed = true;
        break;
      }
    }
  }

  return failed;
};

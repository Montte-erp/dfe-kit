import type { Check, CheckContext } from "../model";
import { isCatalogFile } from "./shared";

const hasInlineMetricName = (context: CheckContext): boolean =>
  !context.path.endsWith("/observability.ts") &&
  /\bMetric\.(?:counter|gauge|histogram|frequency|summary|timer)\s*\(\s*["']/.test(context.rawLine);

const hasInlineObservabilityLiteral = (context: CheckContext): boolean =>
  !isCatalogFile(context.path) &&
  /\b(?:Effect\.withSpan|Effect\.log(?:Info|Warning|Error|Debug)?|Metric\.(?:counter|gauge|histogram|frequency|summary|timer))\s*\(\s*["'](?:saatri\.|dfe\.)/.test(
    context.rawLine,
  );

const hasDomainMagicString = (context: CheckContext): boolean =>
  !isCatalogFile(context.path) &&
  /\b(?:code|operation|phase|schemaName|name)\s*:\s*["'](?:saatri\.|dfe\.|[a-z]+(?:\.[a-z_]+)+|[A-Z][A-Za-z0-9]+)[^"']*["']/.test(
    context.rawLine,
  );

export const observabilityCatalogChecks: readonly Check[] = [
  {
    message: "Métricas Effect devem usar catálogo *MetricNameValue; não use nome inline.",
    test: hasInlineMetricName,
    ignoreImportLine: true,
  },
  {
    message: "Strings observáveis saatri./dfe. devem vir de catálogo, não inline no fluxo.",
    test: hasInlineObservabilityLiteral,
    ignoreImportLine: true,
  },
  {
    message:
      "Strings de domínio em code/operation/phase/schemaName/name devem vir de catálogos typed.",
    test: hasDomainMagicString,
    ignoreImportLine: true,
  },
];

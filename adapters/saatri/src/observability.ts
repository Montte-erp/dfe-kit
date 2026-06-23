import { Metric, Schema } from "effect";

export type SaatriSpanName =
  | "dfe.saatri.issue"
  | "dfe.saatri.envelope.build"
  | "dfe.saatri.sign"
  | "dfe.saatri.http.post"
  | "dfe.saatri.response.parse"
  | "dfe.saatri.xml.parse";

export const saatriSpanNameSchema: Schema.Codec<SaatriSpanName, unknown> = Schema.Literals([
  "dfe.saatri.issue",
  "dfe.saatri.envelope.build",
  "dfe.saatri.sign",
  "dfe.saatri.http.post",
  "dfe.saatri.response.parse",
  "dfe.saatri.xml.parse",
]);
export const SaatriSpanNameValue = {
  issue: "dfe.saatri.issue",
  envelopeBuild: "dfe.saatri.envelope.build",
  sign: "dfe.saatri.sign",
  httpPost: "dfe.saatri.http.post",
  responseParse: "dfe.saatri.response.parse",
  xmlParse: "dfe.saatri.xml.parse",
} satisfies Record<string, SaatriSpanName>;

export type SaatriAttributeName =
  | "dfe.provider.id"
  | "dfe.document.kind"
  | "dfe.environment"
  | "dfe.city.code"
  | "dfe.document.series"
  | "dfe.document.number"
  | "dfe.document.status"
  | "dfe.correlation.id"
  | "dfe.error.code"
  | "dfe.error.phase"
  | "dfe.phase"
  | "dfe.xml.bytes"
  | "dfe.saatri.timeout_ms"
  | "dfe.saatri.max_retries"
  | "http.request.method"
  | "http.response.status_code";

export const saatriAttributeNameSchema: Schema.Codec<SaatriAttributeName, unknown> =
  Schema.Literals([
    "dfe.provider.id",
    "dfe.document.kind",
    "dfe.environment",
    "dfe.city.code",
    "dfe.document.series",
    "dfe.document.number",
    "dfe.document.status",
    "dfe.correlation.id",
    "dfe.error.code",
    "dfe.error.phase",
    "dfe.phase",
    "dfe.xml.bytes",
    "dfe.saatri.timeout_ms",
    "dfe.saatri.max_retries",
    "http.request.method",
    "http.response.status_code",
  ]);
export const SaatriAttributeNameValue = {
  providerId: "dfe.provider.id",
  documentKind: "dfe.document.kind",
  environment: "dfe.environment",
  cityCode: "dfe.city.code",
  documentSeries: "dfe.document.series",
  documentNumber: "dfe.document.number",
  documentStatus: "dfe.document.status",
  correlationId: "dfe.correlation.id",
  errorCode: "dfe.error.code",
  errorPhase: "dfe.error.phase",
  phase: "dfe.phase",
  xmlBytes: "dfe.xml.bytes",
  timeoutMs: "dfe.saatri.timeout_ms",
  maxRetries: "dfe.saatri.max_retries",
  httpRequestMethod: "http.request.method",
  httpResponseStatusCode: "http.response.status_code",
} satisfies Record<string, SaatriAttributeName>;

export type SaatriMetricName =
  | "dfe_saatri_issue_total"
  | "dfe_saatri_issue_error_total"
  | "dfe_saatri_fiscal_status_total"
  | "dfe_saatri_http_attempt_total"
  | "dfe_saatri_http_status_total"
  | "dfe_saatri_http_retry_total"
  | "dfe_saatri_parse_error_total"
  | "dfe_saatri_xml_bytes";

export const saatriMetricNameSchema: Schema.Codec<SaatriMetricName, unknown> = Schema.Literals([
  "dfe_saatri_issue_total",
  "dfe_saatri_issue_error_total",
  "dfe_saatri_fiscal_status_total",
  "dfe_saatri_http_attempt_total",
  "dfe_saatri_http_status_total",
  "dfe_saatri_http_retry_total",
  "dfe_saatri_parse_error_total",
  "dfe_saatri_xml_bytes",
]);
export const SaatriMetricNameValue = {
  issueTotal: "dfe_saatri_issue_total",
  issueErrorTotal: "dfe_saatri_issue_error_total",
  fiscalStatusTotal: "dfe_saatri_fiscal_status_total",
  httpAttemptTotal: "dfe_saatri_http_attempt_total",
  httpStatusTotal: "dfe_saatri_http_status_total",
  httpRetryTotal: "dfe_saatri_http_retry_total",
  parseErrorTotal: "dfe_saatri_parse_error_total",
  xmlBytes: "dfe_saatri_xml_bytes",
} satisfies Record<string, SaatriMetricName>;

export const saatriIssueTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.issueTotal,
  {
    description: "Total de emissões SAATRI iniciadas.",
    incremental: true,
  },
);

export const saatriIssueErrorTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.issueErrorTotal,
  {
    description: "Total de falhas técnicas em emissões SAATRI.",
    incremental: true,
  },
);

export const saatriFiscalStatusTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.fiscalStatusTotal,
  {
    description: "Total de respostas fiscais SAATRI por status.",
    incremental: true,
  },
);

export const saatriHttpAttemptTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.httpAttemptTotal,
  {
    description: "Total de tentativas HTTP SAATRI.",
    incremental: true,
  },
);

export const saatriHttpStatusTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.httpStatusTotal,
  {
    description: "Total de respostas HTTP SAATRI por status.",
    incremental: true,
  },
);

export const saatriHttpRetryTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.httpRetryTotal,
  {
    description: "Total de falhas HTTP SAATRI elegíveis ao retry.",
    incremental: true,
  },
);

export const saatriParseErrorTotal: Metric.Counter<number> = Metric.counter(
  SaatriMetricNameValue.parseErrorTotal,
  {
    description: "Total de falhas de parse/decode XML SAATRI.",
    incremental: true,
  },
);

export const saatriXmlBytes: Metric.Histogram<number> = Metric.histogram(
  SaatriMetricNameValue.xmlBytes,
  {
    description: "Tamanho dos XMLs processados pelo adapter SAATRI em bytes UTF-8.",
    boundaries: [1_024, 8_192, 32_768, 131_072, 524_288, 1_048_576],
  },
);

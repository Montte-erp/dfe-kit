import type {
  FiscalProviderCapability,
  FiscalProviderCapabilityMetadata,
  FiscalProviderManifest,
} from "@dfe-kit/fiscal";
import { defineAuditCatalog, defineErrorCatalog } from "evlog";
import { z } from "zod";

export const saatriAuditCatalog = defineAuditCatalog("saatri", {
  ISSUE_STARTED: { target: "nfse" },
  ENVELOPE_BUILD_STARTED: { target: "nfse" },
  ENVELOPE_BUILD_SUCCEEDED: { target: "nfse" },
  ENVELOPE_BUILD_FAILED: { target: "nfse" },
  SIGN_STARTED: { target: "nfse" },
  SIGN_SUCCEEDED: { target: "nfse" },
  SIGN_FAILED: { target: "nfse" },
  HTTP_POST_STARTED: { target: "nfse" },
  HTTP_POST_SUCCEEDED: { target: "nfse" },
  HTTP_POST_FAILED: { target: "nfse" },
  RESPONSE_PARSE_STARTED: { target: "nfse" },
  RESPONSE_PARSE_SUCCEEDED: { target: "nfse" },
  RESPONSE_PARSE_FAILED: { target: "nfse" },
  FISCAL_AUTHORIZED: { target: "nfse" },
  FISCAL_REJECTED: { target: "nfse" },
  ARTIFACT_CREATED: { target: "nfse" },
  OPTIONAL_SIGNER_NOT_CONFIGURED: { target: "nfse" },
});

export const saatriErrorCatalog = defineErrorCatalog("saatri", {
  NETWORK_ERROR: {
    message: "Falha de rede ao comunicar com o servidor SAATRI.",
    tags: ["saatri", "transport"],
  },
  RESPONSE_READ_ERROR: {
    message: "Não foi possível ler o corpo da resposta SAATRI.",
    tags: ["saatri", "transport"],
  },
  HTTP_STATUS_ERROR: {
    message: ({ status }: { status: number }) =>
      `Servidor SAATRI respondeu com status HTTP ${status}.`,
    tags: ["saatri", "transport"],
  },
  PARSE_ERROR: {
    message: ({ reason }: { reason: string }) => reason,
    tags: ["saatri", "parse"],
  },
  RESPONSE_SHAPE_ERROR: {
    message:
      "Resposta da SAATRI sem <outputXML> de GerarNfseResponse. O servidor pode ter retornado um SOAP Fault ou erro de autenticação.",
    tags: ["saatri", "parse"],
  },
  XML_SIZE_LIMIT_EXCEEDED: {
    message: "XML SAATRI excede o limite de 512 KB informado pelo provedor.",
    tags: ["saatri", "validation"],
  },
});

declare module "evlog" {
  interface RegisteredAuditCatalogs {
    saatri: typeof saatriAuditCatalog;
  }

  interface RegisteredErrorCatalogs {
    saatri: typeof saatriErrorCatalog;
  }
}

export const saatriCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  issuerCnpj: z.string().regex(/^\d{14}$/),
  municipalRegistration: z.string().min(1),
});

export type SaatriCredentials = z.infer<typeof saatriCredentialsSchema>;

export const saatriEnvironmentConfigSchema = z.object({
  environment: z.enum(["homologation", "production"]),
  endpoint: z.url(),
  cityCode: z.string().regex(/^\d{7}$/),
});

export type SaatriEnvironmentConfig = z.infer<typeof saatriEnvironmentConfigSchema>;

export const saatriProviderPackageConfigSchema = z.object({
  providerId: z.string().min(1),
  providerName: z.string().min(1),
  cityCode: z.string().regex(/^\d{7}$/),
  endpoints: z.object({
    homologation: z.url(),
    production: z.url(),
  }),
  extraCapabilityMetadata: z
    .custom<readonly FiscalProviderCapabilityMetadata[]>((value) => Array.isArray(value))
    .optional(),
});

export const createSaatriProviderOptionsSchema = z.object({
  environment: z.enum(["homologation", "production"]),
  timeoutMs: z.number().int().positive().optional(),
  signer: z.custom<unknown>().optional(),
  eventSink: z.custom<unknown>().optional(),
});

export const saatriIssueRuntimeConfigSchema = z.object({
  credentials: saatriCredentialsSchema,
  config: saatriEnvironmentConfigSchema,
});

export const saatriSoapHeaderSchema = z.object({
  cabecalhoVersion: z.literal("2.01"),
  dataVersion: z.literal("2.03"),
  usernameToken: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
});

export type SaatriSoapHeader = z.infer<typeof saatriSoapHeaderSchema>;

export const returnMessageSchema = z.object({
  Codigo: z.coerce.string(),
  Mensagem: z.coerce.string(),
  Correcao: z.coerce.string().optional(),
});

export type ReturnMessage = z.infer<typeof returnMessageSchema>;

export const generateNfseSuccessResponseSchema = z.object({
  ListaNfse: z.object({
    CompNfse: z.object({
      Nfse: z.object({
        InfNfse: z.object({
          Numero: z.coerce.string(),
          CodigoVerificacao: z.coerce.string(),
          DataEmissao: z.coerce.string().optional(),
        }),
      }),
    }),
  }),
});

export type GenerateNfseSuccessResponse = z.infer<typeof generateNfseSuccessResponseSchema>;

export const generateNfseErrorResponseSchema = z.object({
  ListaMensagemRetorno: z.object({
    MensagemRetorno: z
      .union([returnMessageSchema, z.array(returnMessageSchema)])
      .transform((message) => (Array.isArray(message) ? message : [message])),
  }),
});

export type GenerateNfseErrorResponse = z.infer<typeof generateNfseErrorResponseSchema>;

export const generateNfseResponseSchema = z.union([
  generateNfseSuccessResponseSchema,
  generateNfseErrorResponseSchema,
]);

export type GenerateNfseResponse = z.infer<typeof generateNfseResponseSchema>;

export const generateNfseSoapDocumentSchema = z.object({
  Envelope: z.object({
    Body: z.object({
      GerarNfseResponse: z.object({
        outputXML: z.string().min(1),
      }),
    }),
  }),
});

export type GenerateNfseSoapDocument = z.infer<typeof generateNfseSoapDocumentSchema>;

export const generateNfseOutputDocumentSchema = z.union([
  z.object({ GerarNfseResposta: generateNfseResponseSchema }),
  generateNfseResponseSchema,
]);

export type GenerateNfseOutputDocument = z.infer<typeof generateNfseOutputDocumentSchema>;

export type SaatriEventName =
  | "saatri.issue.started"
  | "saatri.envelope.build.started"
  | "saatri.envelope.build.succeeded"
  | "saatri.envelope.build.failed"
  | "saatri.sign.started"
  | "saatri.sign.succeeded"
  | "saatri.sign.failed"
  | "saatri.http.post.started"
  | "saatri.http.post.succeeded"
  | "saatri.http.post.failed"
  | "saatri.response.parse.started"
  | "saatri.response.parse.succeeded"
  | "saatri.response.parse.failed"
  | "saatri.fiscal.authorized"
  | "saatri.fiscal.rejected"
  | "saatri.artifact.created"
  | "saatri.optional.signer.not_configured";

export interface SaatriEvent {
  readonly name: SaatriEventName;
  readonly providerId: string;
  readonly documentKind: "nfe" | "nfce" | "nfse";
  readonly environment: "homologation" | "production";
  readonly cityCode: string;
  readonly series: string;
  readonly number: string;
  readonly correlationId?: string;
}

export type SaatriEventSink = (event: SaatriEvent) => void;

export const SAATRI_ABRASF_VERSION = "2.03";

export const SAATRI_ABRASF_203_CAPABILITIES = [
  "issue_nfse",
] as const satisfies readonly FiscalProviderCapability[];

export const SAATRI_ABRASF_203_CAPABILITY_METADATA = [
  {
    capability: "issue_nfse",
    status: "supported",
    environments: ["homologation", "production"],
    reason:
      "Implementado via operação SAATRI GerarNfse ABRASF 2.03; respostas 2026 podem ficar pendentes por compartilhamento com ambiente nacional.",
    requiresSigner: false,
    requiresCertificateOutsideDFeKit: false,
  },
  {
    capability: "generate_nfse",
    status: "supported",
    environments: ["homologation", "production"],
    reason: "Equivalente operacional a issue_nfse neste adapter.",
    requiresSigner: false,
    requiresCertificateOutsideDFeKit: false,
  },
  {
    capability: "query_nfse_by_rps",
    status: "unverified_in_homologation",
    environments: ["homologation", "production"],
    reason:
      "Manual SAATRI lista ConsultaNfsePorRps, mas o fluxo ainda não tem implementação e prova automatizada.",
  },
  {
    capability: "submit_rps_batch",
    status: "unverified_in_homologation",
    reason: "Manual lista recepção de lote RPS, ainda não homologado no DFeKit.",
  },
  {
    capability: "submit_rps_batch_sync",
    status: "unverified_in_homologation",
    reason: "Manual lista envio de lote síncrono, ainda não homologado no DFeKit.",
  },
  {
    capability: "query_rps_batch",
    status: "unverified_in_homologation",
    reason: "Manual lista consulta de lote RPS, ainda não homologada no DFeKit.",
  },
  {
    capability: "query_issued_nfse",
    status: "unverified_in_homologation",
    reason: "Manual lista consulta de NFS-e prestadas, ainda não homologada no DFeKit.",
  },
  {
    capability: "query_received_nfse",
    status: "unverified_in_homologation",
    reason: "Manual lista consulta de NFS-e tomadas, ainda não homologada no DFeKit.",
  },
  {
    capability: "query_nfse_range",
    status: "unverified_in_homologation",
    reason: "Manual lista consulta por faixa, ainda não homologada no DFeKit.",
  },
  {
    capability: "cancel_nfse",
    status: "unverified_in_homologation",
    reason: "Manual lista cancelamento, ainda não homologado no DFeKit.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: "replace_nfse",
    status: "unverified_in_homologation",
    reason: "Manual lista substituição, ainda não homologada no DFeKit.",
    requiresCertificateOutsideDFeKit: true,
  },
  {
    capability: "issue_nfe",
    status: "unsupported",
    reason: "SAATRI é provider municipal de NFS-e, não NF-e modelo 55.",
  },
  {
    capability: "issue_nfce",
    status: "unsupported",
    reason: "SAATRI é provider municipal de NFS-e, não NFC-e modelo 65.",
  },
] as const satisfies readonly FiscalProviderCapabilityMetadata[];

export interface ConfigureSaatriManifestInput {
  readonly providerId: string;
  readonly providerName: string;
  readonly extraCapabilityMetadata?: readonly FiscalProviderCapabilityMetadata[];
}

export const configureSaatriManifest = (
  input: ConfigureSaatriManifestInput,
): FiscalProviderManifest => ({
  id: input.providerId,
  name: input.providerName,
  documentKinds: ["nfse"],
  environments: ["homologation", "production"],
  capabilities: SAATRI_ABRASF_203_CAPABILITIES,
  capabilityMetadata: [
    ...SAATRI_ABRASF_203_CAPABILITY_METADATA,
    ...(input.extraCapabilityMetadata ?? []),
  ],
});
